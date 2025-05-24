import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserPreferences,
  Analytics,
  ExtensionState,
  ToneAnalysis,
  FeedbackData,
  Platform,
} from "@/types";

interface AppStore extends ExtensionState {
  // User Preferences
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;

  // Analytics
  analytics: Analytics;
  updateAnalytics: (data: Partial<Analytics>) => void;
  recordSuggestionFeedback: (feedback: FeedbackData) => void;

  // Extension State
  setEnabled: (enabled: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setCurrentAnalysis: (analysis: ToneAnalysis | undefined) => void;
  setError: (error: string | undefined) => void;
  addToCache: (text: string, analysis: ToneAnalysis) => void;
  getFromCache: (text: string) => ToneAnalysis | undefined;

  // Platform Detection
  currentPlatform: Platform;
  setCurrentPlatform: (platform: Platform) => void;

  // UI State
  showWidget: boolean;
  widgetPosition: { x: number; y: number };
  setShowWidget: (show: boolean) => void;
  setWidgetPosition: (position: { x: number; y: number }) => void;
}

const defaultPreferences: UserPreferences = {
  apiKey: "",
  provider: "gemini",
  sensitivity: 5,
  autoMode: true,
  enabledPlatforms: [
    "gmail",
    "slack",
    "linkedin",
    "github",
    "discord",
    "teams",
  ],
  formalityPreference: "semi-formal",
  personalStyle: "professional",
  blacklistedWords: [],
  profiles: [],
  notifications: {
    showTooltips: true,
    showBadges: true,
    soundEnabled: false,
    frequency: "immediate",
  },
};

const defaultAnalytics: Analytics = {
  suggestionsGenerated: 0,
  suggestionsAccepted: 0,
  suggestionsRejected: 0,
  platformUsage: {
    gmail: 0,
    slack: 0,
    linkedin: 0,
    github: 0,
    discord: 0,
    teams: 0,
    other: 0,
  },
  improvementCategories: {
    aggressive: 0,
    "passive-aggressive": 0,
    "overly-formal": 0,
    "too-casual": 0,
    unclear: 0,
    "potentially-offensive": 0,
    "micro-aggression": 0,
    "cultural-insensitive": 0,
    emotional: 0,
    demanding: 0,
    dismissive: 0,
  },
  averageProcessingTime: 0,
  userSatisfactionScore: 0,
  timesSaved: 0,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isEnabled: true,
      currentAnalysis: undefined,
      isProcessing: false,
      error: undefined,
      lastProcessedText: "",
      cache: new Map(),
      preferences: defaultPreferences,
      analytics: defaultAnalytics,
      currentPlatform: "other",
      showWidget: false,
      widgetPosition: { x: 0, y: 0 },

      // User Preferences actions
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      // Analytics actions
      updateAnalytics: (data) =>
        set((state) => ({
          analytics: { ...state.analytics, ...data },
        })),

      recordSuggestionFeedback: (feedback) => {
        const { analytics } = get();
        const isPositive = feedback.rating >= 4 || feedback.helpful;

        set({
          analytics: {
            ...analytics,
            suggestionsAccepted: isPositive
              ? analytics.suggestionsAccepted + 1
              : analytics.suggestionsAccepted,
            suggestionsRejected: !isPositive
              ? analytics.suggestionsRejected + 1
              : analytics.suggestionsRejected,
            userSatisfactionScore:
              (analytics.userSatisfactionScore + feedback.rating) / 2,
          },
        });
      },

      // Extension State actions
      setEnabled: (enabled) => set({ isEnabled: enabled }),

      setProcessing: (processing) => set({ isProcessing: processing }),

      setCurrentAnalysis: (analysis) => {
        if (analysis) {
          const { analytics, currentPlatform } = get();
          set({
            currentAnalysis: analysis,
            analytics: {
              ...analytics,
              suggestionsGenerated: analytics.suggestionsGenerated + 1,
              platformUsage: {
                ...analytics.platformUsage,
                [currentPlatform]: analytics.platformUsage[currentPlatform] + 1,
              },
              averageProcessingTime:
                (analytics.averageProcessingTime + analysis.processingTime) / 2,
            },
          });
        } else {
          set({ currentAnalysis: analysis });
        }
      },

      setError: (error) => set({ error }),

      addToCache: (text, analysis) => {
        const { cache } = get();
        const newCache = new Map(cache);
        newCache.set(text.trim().toLowerCase(), analysis); // Limite du cache à 100 entrées
        if (newCache.size > 100) {
          const firstKey = newCache.keys().next().value;
          if (firstKey) {
            newCache.delete(firstKey);
          }
        }

        set({ cache: newCache });
      },

      getFromCache: (text) => {
        const { cache } = get();
        return cache.get(text.trim().toLowerCase());
      },

      // Platform actions
      setCurrentPlatform: (platform) => set({ currentPlatform: platform }),

      // UI actions
      setShowWidget: (show) => set({ showWidget: show }),
      setWidgetPosition: (position) => set({ widgetPosition: position }),
    }),
    {
      name: "tonefixer-store",
      partialize: (state) => ({
        preferences: state.preferences,
        analytics: state.analytics,
        isEnabled: state.isEnabled,
      }),
    }
  )
);
