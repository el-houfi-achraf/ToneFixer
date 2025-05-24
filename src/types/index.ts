export interface ToneAnalysis {
  score: number; // 0-100
  level: ToneLevel;
  issues: ToneIssue[];
  suggestions: ToneSuggestion[];
  context: MessageContext;
  confidence: number;
  processingTime: number;
}

export interface ToneIssue {
  id: string;
  type: ToneIssueType;
  severity: "low" | "medium" | "high";
  text: string;
  position: { start: number; end: number };
  description: string;
  risk: RiskLevel;
}

export interface ToneSuggestion {
  id: string;
  original: string;
  improved: string;
  type: SuggestionType;
  explanation: string;
  confidence: number;
  position: { start: number; end: number };
}

export interface MessageContext {
  platform: Platform;
  messageType: MessageType;
  relationship: RelationshipType;
  formality: FormalityLevel;
  urgency: UrgencyLevel;
  language: string;
  threadContext?: string;
  recipientContext?: string;
}

export interface UserPreferences {
  apiKey: string;
  provider: "gemini" | "claude";
  sensitivity: number; // 1-10
  autoMode: boolean;
  enabledPlatforms: Platform[];
  formalityPreference: FormalityLevel;
  personalStyle: PersonalStyle;
  blacklistedWords: string[];
  profiles: UserProfile[];
  notifications: NotificationSettings;
}

export interface UserProfile {
  id: string;
  name: string;
  context: "work" | "personal" | "academic";
  settings: Partial<UserPreferences>;
}

export interface NotificationSettings {
  showTooltips: boolean;
  showBadges: boolean;
  soundEnabled: boolean;
  frequency: "immediate" | "batched" | "silent";
}

export interface Analytics {
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  suggestionsRejected: number;
  platformUsage: Record<Platform, number>;
  improvementCategories: Record<ToneIssueType, number>;
  averageProcessingTime: number;
  userSatisfactionScore: number;
  timesSaved: number; // in minutes
}

export interface FeedbackData {
  suggestionId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  comment?: string;
  timestamp: number;
  context: MessageContext;
}

export type ToneLevel = "excellent" | "good" | "fair" | "poor" | "problematic";

export type ToneIssueType =
  | "aggressive"
  | "passive-aggressive"
  | "overly-formal"
  | "too-casual"
  | "unclear"
  | "potentially-offensive"
  | "micro-aggression"
  | "cultural-insensitive"
  | "emotional"
  | "demanding"
  | "dismissive";

export type SuggestionType =
  | "diplomatic"
  | "direct-cordial"
  | "empathetic"
  | "professional"
  | "friendly"
  | "clarifying";

export type Platform =
  | "gmail"
  | "slack"
  | "linkedin"
  | "github"
  | "discord"
  | "teams"
  | "other";

export type MessageType =
  | "email"
  | "chat"
  | "comment"
  | "post"
  | "review"
  | "issue"
  | "pull-request";

export type RelationshipType =
  | "manager-to-employee"
  | "employee-to-manager"
  | "peer-to-peer"
  | "client-to-vendor"
  | "vendor-to-client"
  | "unknown";

export type FormalityLevel =
  | "very-formal"
  | "formal"
  | "semi-formal"
  | "casual"
  | "informal";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type RiskLevel = "low" | "medium" | "high";

export type PersonalStyle =
  | "concise"
  | "detailed"
  | "friendly"
  | "professional"
  | "creative"
  | "analytical";

export interface ExtensionState {
  isEnabled: boolean;
  currentAnalysis?: ToneAnalysis;
  isProcessing: boolean;
  error?: string;
  lastProcessedText: string;
  cache: Map<string, ToneAnalysis>;
}
