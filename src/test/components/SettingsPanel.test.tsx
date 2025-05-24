import { render, screen } from "@testing-library/react";
import { SettingsPanel } from "@/components/SettingsPanel";

// Mock du store Zustand
jest.mock("@/stores/appStore", () => ({
  useAppStore: () => ({
    preferences: {
      apiKey: "",
      provider: "gemini" as const,
      sensitivity: 5,
      autoMode: true,
      enabledPlatforms: ["gmail", "slack"],
      formalityPreference: "semi-formal" as const,
      personalStyle: "professional" as const,
      blacklistedWords: [],
      profiles: [],
      notifications: {
        showTooltips: true,
        showBadges: true,
        soundEnabled: false,
        frequency: "immediate" as const,
      },
    },
    updatePreferences: jest.fn(),
    analytics: {
      totalAnalyses: 0,
      suggestionsAccepted: 0,
      suggestionsRejected: 0,
      averageConfidence: 0,
      platformUsage: {},
      issueTypes: {},
      dailyUsage: {},
      weeklyUsage: {},
      monthlyUsage: {},
    },
  }),
}));

describe("SettingsPanel", () => {
  test("renders settings tabs", () => {
    render(<SettingsPanel />);

    expect(screen.getByText("Général")).toBeInTheDocument();
    expect(screen.getByText("API")).toBeInTheDocument();
    expect(screen.getByText("Avancé")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  test("shows API configuration section", () => {
    render(<SettingsPanel />);

    // Cliquer sur l'onglet API
    const apiTab = screen.getByText("API");
    apiTab.click();

    expect(screen.getByText("Configuration API")).toBeInTheDocument();
    expect(screen.getByText("Fournisseur d'IA")).toBeInTheDocument();
  });
});
