import { useAppStore } from "@/stores/appStore";

class ToneFixerBackgroundService {
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.isInitialized) return;

    console.log("ToneFixer: Service Worker démarré");

    // Initialiser le store
    this.initializeStore();

    // Configurer les listeners
    this.setupListeners();

    // Vérifier la configuration au démarrage
    this.checkConfiguration();

    this.isInitialized = true;
  }
  private initializeStore() {
    // Le store Zustand sera automatiquement initialisé lors de la première utilisation
    const store = useAppStore.getState();
    console.log("ToneFixer: Store initialisé", {
      enabled: store.isEnabled,
      provider: store.preferences.provider,
    });

    // S'assurer que les préférences par défaut sont configurées
    this.ensureDefaultPreferences();
  }

  private setupListeners() {
    // Écouter les messages des content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Pour les réponses asynchrones
    });

    // Écouter les clics sur l'icône de l'extension
    chrome.action.onClicked.addListener((tab) => {
      this.handleActionClick(tab);
    });

    // Écouter les changements d'onglets
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabActivated(activeInfo);
    });

    // Écouter les mises à jour d'onglets
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdated(tabId, changeInfo, tab);
    });

    // Écouter l'installation/mise à jour de l'extension
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstalled(details);
    });
  }

  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) {
    try {
      switch (message.type) {
        case "GET_PREFERENCES":
          const store = useAppStore.getState();
          console.log(
            "ToneFixer Background: Envoi des préférences:",
            store.preferences
          );
          sendResponse({ preferences: store.preferences });
          break;

        case "UPDATE_PREFERENCES":
          const { updatePreferences } = useAppStore.getState();
          updatePreferences(message.preferences);
          sendResponse({ success: true });
          break;

        case "ANALYZE_TEXT":
          const analysis = await this.analyzeText(
            message.text,
            message.context
          );
          sendResponse({ analysis });
          break;

        case "RECORD_FEEDBACK":
          const { recordSuggestionFeedback } = useAppStore.getState();
          recordSuggestionFeedback(message.feedback);
          sendResponse({ success: true });
          break;

        case "GET_ANALYTICS":
          const { analytics } = useAppStore.getState();
          sendResponse({ analytics });
          break;
        case "TOGGLE_EXTENSION":
          await this.toggleExtension();
          sendResponse({ success: true });
          break;
        case "VALIDATE_API_KEY":
          const apiPrefs = useAppStore.getState().preferences;
          console.log("ToneFixer: Validation de la clé API", apiPrefs.provider);
          try {
            const isValid = await this.validateApiKey(apiPrefs);
            if (isValid) {
              console.log("ToneFixer: Clé API validée avec succès");
              // Force refresh des badges pour refléter la nouvelle configuration
              const tabs = await chrome.tabs.query({});
              tabs.forEach((tab) => this.updateBadgeForTab(tab));

              // Notifier tous les onglets que l'API est configurée
              tabs.forEach((tab) => {
                if (tab.id) {
                  chrome.tabs
                    .sendMessage(tab.id, {
                      type: "API_KEY_UPDATED",
                      apiKey: apiPrefs.apiKey,
                    })
                    .catch(() => {
                      // Ignorer les erreurs pour les onglets non supportés
                    });
                }
              });

              sendResponse({ success: true, message: "Clé API valide" });
            } else {
              console.warn("ToneFixer: Clé API invalide");
              sendResponse({ success: false, message: "Clé API invalide" });
            }
          } catch (error) {
            console.error(
              "ToneFixer: Erreur lors de la validation de la clé API",
              error
            );
            sendResponse({
              success: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Erreur de validation de la clé API",
            });
          }
          break;

        case "SHOW_NOTIFICATION":
          try {
            if (message.title && message.message) {
              chrome.notifications.create({
                type: "basic",
                iconUrl: chrome.runtime.getURL("icons/icon128.png"),
                title: message.title,
                message: message.message,
                priority: 1,
              });

              console.log("ToneFixer: Notification affichée:", message.title);
              sendResponse({ success: true });
            } else {
              sendResponse({
                success: false,
                message: "Informations de notification incomplètes",
              });
            }
          } catch (error) {
            console.error(
              "ToneFixer: Erreur lors de l'affichage de la notification:",
              error
            );
            sendResponse({ success: false, error: String(error) });
          }
          break;

        default:
          sendResponse({ error: "Type de message inconnu" });
      }
    } catch (error) {
      console.error("ToneFixer: Erreur dans handleMessage:", error);
      sendResponse({
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  private async handleActionClick(tab: chrome.tabs.Tab) {
    try {
      // Ouvrir le popup (géré automatiquement par le manifest)
      console.log("ToneFixer: Clic sur l'action pour l'onglet:", tab.id);
    } catch (error) {
      console.error("ToneFixer: Erreur lors du clic sur l'action:", error);
    }
  }
  private async handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
    if (!activeInfo || typeof activeInfo.tabId !== "number") {
      console.warn("ToneFixer: Informations d'activation d'onglet invalides");
      return;
    }

    try {
      // Vérification plus robuste avant d'accéder à l'onglet
      if (activeInfo.tabId < 0) {
        console.log("ToneFixer: ID d'onglet invalide:", activeInfo.tabId);
        return;
      }

      // Vérifier si l'onglet existe toujours avant d'y accéder
      chrome.tabs.get(activeInfo.tabId, async (tab) => {
        if (chrome.runtime.lastError) {
          // Journalisation plus douce - c'est un cas commun que les onglets puissent disparaître
          console.log(
            "ToneFixer: Onglet non disponible:",
            chrome.runtime.lastError.message
          );
          return; // L'onglet n'existe plus ou n'est pas accessible
        }

        if (tab) {
          await this.updateBadgeForTab(tab);
        }
      });
    } catch (error) {
      // Journalisation plus informative
      console.log(
        "ToneFixer: Exception lors de l'activation d'onglet:",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
    }
  }

  private async handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) {
    if (changeInfo.status === "complete" && tab.url) {
      await this.updateBadgeForTab(tab);
    }
  }
  private async handleInstalled(details: chrome.runtime.InstalledDetails) {
    console.log("ToneFixer: Extension installée/mise à jour:", details.reason);

    // S'assurer que les préférences par défaut sont configurées
    this.ensureDefaultPreferences();

    if (details.reason === "install") {
      // Première installation
      await this.showWelcomePage();
    } else if (details.reason === "update") {
      // Mise à jour
      await this.handleUpdate(details.previousVersion);
    }
  }

  private ensureDefaultPreferences() {
    const store = useAppStore.getState();
    console.log("ToneFixer: Vérification des préférences par défaut");

    // Forcer la création des préférences par défaut si elles n'existent pas
    if (
      !store.preferences.enabledPlatforms ||
      store.preferences.enabledPlatforms.length === 0
    ) {
      console.log("ToneFixer: Configuration des préférences par défaut");
      store.updatePreferences({
        enabledPlatforms: [
          "gmail",
          "slack",
          "linkedin",
          "github",
          "discord",
          "teams",
        ],
        autoMode: true,
        sensitivity: 5,
        provider: "gemini",
      });
    }
  }

  private async analyzeText(text: string, context: any) {
    // Cette méthode sera appelée depuis les content scripts
    // pour déléguer l'analyse au service worker si nécessaire

    // Pour l'instant, on retourne une analyse basique
    // L'analyse principale se fait dans le content script
    return {
      score: 75,
      level: "good",
      issues: [],
      suggestions: [],
      context,
      confidence: 0.8,
      processingTime: 100,
    };
  }
  private async toggleExtension() {
    const { isEnabled, setEnabled } = useAppStore.getState();
    const newState = !isEnabled;
    setEnabled(newState);

    console.log(`ToneFixer: Extension ${newState ? "activée" : "désactivée"}`);

    try {
      // Notifier tous les onglets du changement
      const tabs = await chrome.tabs.query({});

      // Utiliser Promise.allSettled pour gérer chaque onglet indépendamment
      await Promise.allSettled(
        tabs
          .filter((tab) => tab && tab.id)
          .map(async (tab) => {
            try {
              if (tab.id) {
                await new Promise<void>((resolve) => {
                  chrome.tabs.sendMessage(
                    tab.id!,
                    { type: "EXTENSION_TOGGLED", enabled: newState },
                    () => {
                      // Ignorer les erreurs runtime (onglets non supportés)
                      if (chrome.runtime.lastError) {
                        // Rien à faire, c'est normal pour les onglets où le content script n'est pas injecté
                      }
                      resolve();
                    }
                  );
                });

                // Mise à jour du badge après notification
                await this.updateBadgeForTab(tab);
              }
            } catch (tabError) {
              // Gestion individuelle des erreurs par onglet
              console.log(
                `ToneFixer: Impossible de notifier l'onglet ${tab.id}:`,
                tabError instanceof Error ? tabError.message : "Erreur inconnue"
              );
            }
          })
      );
    } catch (error) {
      console.error(
        "ToneFixer: Erreur lors du basculement de l'extension:",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
    }
  }
  private async updateBadgeForTab(tab: chrome.tabs.Tab) {
    try {
      if (!tab || !tab.url || !tab.id) {
        console.log(
          "ToneFixer: Onglet invalide, impossible de mettre à jour le badge"
        );
        return;
      }

      // Améliorer la gestion des erreurs avec une promesse
      try {
        // On vérifie d'abord si l'onglet existe encore
        chrome.tabs.get(tab.id, (currentTab) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "ToneFixer: Impossible de mettre à jour le badge, onglet non disponible:",
              chrome.runtime.lastError.message
            );
            return;
          }

          // Si nous arrivons ici, l'onglet existe encore
          try {
            this.doUpdateBadge(currentTab);
          } catch (innerError) {
            console.warn(
              "ToneFixer: Erreur lors de la mise à jour du badge:",
              innerError
            );
          }
        });
      } catch (tabError) {
        console.warn("ToneFixer: Erreur lors de l'accès à l'onglet:", tabError);
      }
    } catch (error) {
      console.warn("ToneFixer: Erreur mise à jour badge:", error);
    }
  }
  private doUpdateBadge(tab: chrome.tabs.Tab) {
    if (!tab.url || !tab.id) return;

    const store = useAppStore.getState();

    try {
      const url = new URL(tab.url);
      const hostname = url.hostname;

      // Déterminer si la plateforme est supportée
      const supportedDomains = [
        "mail.google.com",
        "slack.com",
        "app.slack.com",
        "linkedin.com",
        "www.linkedin.com",
        "github.com",
        "discord.com",
        "teams.microsoft.com",
      ];

      const isSupported = supportedDomains.some((domain) =>
        hostname.includes(domain)
      );

      if (!isSupported) {
        // Pas de badge pour les sites non supportés
        chrome.action.setBadgeText({ text: "", tabId: tab.id });
        return;
      }

      if (!store.isEnabled) {
        // Extension désactivée
        chrome.action.setBadgeText({ text: "⏸", tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({
          color: "#9ca3af",
          tabId: tab.id,
        });
      } else if (!store.preferences.apiKey) {
        // Configuration manquante
        chrome.action.setBadgeText({ text: "⚙", tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({
          color: "#f59e0b",
          tabId: tab.id,
        });
      } else {
        // Actif
        chrome.action.setBadgeText({ text: "✓", tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({
          color: "#10b981",
          tabId: tab.id,
        });
      }
    } catch (error) {
      console.warn("ToneFixer: Erreur lors de la mise à jour du badge:", error);
    }
  }

  private async checkConfiguration() {
    const store = useAppStore.getState();

    if (!store.preferences.apiKey) {
      console.warn("ToneFixer: Aucune clé API configurée");

      // Optionnel: ouvrir la page de configuration
      // chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    }

    // Vérifier la validité de la clé API
    if (store.preferences.apiKey) {
      await this.validateApiKey(store.preferences);
    }
  }
  private async validateApiKey(preferences: any): Promise<boolean> {
    try {
      if (!preferences.apiKey || preferences.apiKey.trim() === "") {
        console.warn("ToneFixer: Aucune clé API fournie");
        return false;
      }

      // Test basique de la clé API
      if (preferences.provider === "gemini") {
        console.log("ToneFixer: Validation de la clé API Gemini...");
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${preferences.apiKey}`
        );
        if (!response.ok) {
          console.warn("ToneFixer: Clé API Gemini invalide");
          return false;
        }
        return true;
      } else if (preferences.provider === "claude") {
        // Pour Claude, on ne peut pas vraiment tester sans faire un appel coûteux
        // On assume que la clé est valide si elle a le bon format
        if (!preferences.apiKey.startsWith("sk-ant-")) {
          console.warn("ToneFixer: Format de clé API Claude invalide");
          return false;
        }
        return true;
      }

      return false; // Provider non supporté
    } catch (error) {
      console.error("ToneFixer: Erreur de validation API:", error);
      return false;
    }
  }

  private async showWelcomePage() {
    try {
      await chrome.tabs.create({
        url: chrome.runtime.getURL("welcome.html"),
      });
    } catch (error) {
      console.error(
        "ToneFixer: Erreur d'ouverture de la page d'accueil:",
        error
      );
    }
  }

  private async handleUpdate(previousVersion?: string) {
    console.log(`ToneFixer: Mise à jour depuis la version ${previousVersion}`);

    // Ici on pourrait gérer les migrations de données si nécessaire
    const store = useAppStore.getState();

    // Exemple de migration
    if (previousVersion && this.compareVersions(previousVersion, "1.0.0") < 0) {
      // Migration pour la version 1.0.0
      console.log("ToneFixer: Migration vers v1.0.0");
    }
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart < bPart) return -1;
      if (aPart > bPart) return 1;
    }

    return 0;
  }

  // Méthodes utilitaires pour les analytics
  public async recordAnalytics(data: any) {
    const { updateAnalytics } = useAppStore.getState();
    updateAnalytics(data);
  }

  public async getUsageStats() {
    const { analytics } = useAppStore.getState();
    return analytics;
  }
}

// Initialiser le service de background
const backgroundService = new ToneFixerBackgroundService();

// Exporter pour les tests
export { ToneFixerBackgroundService };
