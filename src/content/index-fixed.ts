import { PlatformDetector } from "@/services/platformDetector";
import { createAIService } from "@/services/aiService";
import { debounce, getPositionInViewport } from "@/utils/helpers";
import type { ToneAnalysis, UserPreferences } from "@/types";

// Interface pour les messages Chrome
interface ChromeMessage {
  type: string;
  data?: any;
  text?: string;
  context?: any;
}

class ToneFixerContentScript {
  private isInitialized = false;
  private observedElements = new Set<HTMLElement>();
  private currentTarget: HTMLElement | null = null;
  private analysisCache = new Map<string, ToneAnalysis>();
  private preferences: UserPreferences | null = null;
  private isEnabled = true;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.isInitialized) return;

    try {
      // Obtenir les préférences depuis le background script
      await this.loadPreferences();

      // Détecter la plateforme
      const platform = PlatformDetector.detectPlatform();
      console.log(`ToneFixer: Détection plateforme - ${platform}`);

      // Vérifier si l'extension est activée pour cette plateforme
      if (
        !this.preferences?.enabledPlatforms.includes(platform) ||
        !this.isEnabled
      ) {
        console.log("ToneFixer: Plateforme désactivée ou extension en pause");
        return;
      }

      // Injecter le widget
      await this.injectWidget();

      // Commencer l'observation
      this.startObserving();

      this.isInitialized = true;
      console.log("ToneFixer: Initialisé avec succès");
    } catch (error) {
      console.error("ToneFixer: Erreur d'initialisation:", error);
    }
  }

  private async loadPreferences(): Promise<void> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_PREFERENCES" }, (response) => {
        if (response?.preferences) {
          this.preferences = response.preferences;
        }
        resolve();
      });
    });
  }

  private async injectWidget() {
    return new Promise<void>((resolve) => {
      // Créer un script pour charger le widget
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("widget.js");
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        console.error("ToneFixer: Erreur de chargement du widget");
        resolve();
      };

      (document.head || document.documentElement).appendChild(script);
    });
  }

  private startObserving() {
    // Observer les changements dans le DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanForTextInputs(node as HTMLElement);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Scanner initial
    this.scanForTextInputs(document.body);
  }

  private scanForTextInputs(container: HTMLElement) {
    const selectors = [
      // Champs de saisie standard
      'input[type="text"]',
      'input[type="email"]',
      "textarea",

      // Éditeurs rich text
      '[contenteditable="true"]',
      '[contenteditable=""]',

      // Sélecteurs spécifiques par plateforme
      ...this.getPlatformSpecificSelectors(),
    ];

    selectors.forEach((selector) => {
      const elements = container.querySelectorAll(
        selector
      ) as NodeListOf<HTMLElement>;
      elements.forEach((element) => {
        if (
          !this.observedElements.has(element) &&
          this.isValidTextInput(element)
        ) {
          this.observeElement(element);
        }
      });
    });
  }

  private getPlatformSpecificSelectors(): string[] {
    const platform = PlatformDetector.detectPlatform();

    switch (platform) {
      case "gmail":
        return [
          '[role="textbox"]',
          ".Am.Al.editable",
          '.editable[contenteditable="true"]',
          'div[aria-label*="message"]',
        ];

      case "slack":
        return [
          '[data-qa="message_input"]',
          ".ql-editor",
          '[contenteditable="true"][data-qa*="message"]',
        ];

      case "linkedin":
        return [
          ".ql-editor",
          '[data-placeholder*="message"]',
          '[data-placeholder*="comment"]',
          ".msg-form__contenteditable",
        ];

      case "github":
        return [
          ".js-comment-field",
          ".comment-form-textarea",
          "#new_comment_field",
          ".js-issue-title",
        ];

      case "discord":
        return [
          '[data-slate-editor="true"]',
          ".slateTextArea-1Mkdgw",
          'div[contenteditable="true"][role="textbox"]',
        ];

      case "teams":
        return [
          '[data-tid="ckeditor"]',
          ".ts-message-compose-box",
          'div[contenteditable="true"][role="textbox"]',
        ];

      default:
        return [];
    }
  }

  private isValidTextInput(element: HTMLElement): boolean {
    // Vérifier si l'élément est visible et interactif
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    // Vérifier si l'élément n'est pas en lecture seule
    if (element.hasAttribute("readonly") || element.hasAttribute("disabled"))
      return false;

    // Vérifier le style display
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;

    // Vérifier que ce n'est pas un élément de recherche ou de navigation
    const excludedTypes = ["search", "password", "number", "tel", "url"];
    if (
      element instanceof HTMLInputElement &&
      excludedTypes.includes(element.type)
    ) {
      return false;
    }

    return true;
  }

  private observeElement(element: HTMLElement) {
    this.observedElements.add(element);

    // Ajouter les event listeners
    element.addEventListener("input", this.handleInput.bind(this));
    element.addEventListener("focus", this.handleFocus.bind(this));
    element.addEventListener("blur", this.handleBlur.bind(this));

    // Ajouter un indicateur visuel subtil
    this.addStatusIndicator(element);

    console.log("ToneFixer: Observation d'un nouvel élément", element);
  }

  private addStatusIndicator(element: HTMLElement) {
    // Ne pas ajouter d'indicateur si déjà présent
    if (element.querySelector(".tonefixer-indicator")) return;

    const indicator = document.createElement("div");
    indicator.className = "tonefixer-indicator";
    indicator.style.cssText = `
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border-radius: 50%;
      opacity: 0.7;
      z-index: 1000;
      pointer-events: none;
      transition: all 0.2s ease;
    `;

    // Positionner l'indicateur
    const parentStyle = window.getComputedStyle(
      element.parentElement || element
    );
    if (parentStyle.position === "static") {
      (element.parentElement || element).style.position = "relative";
    }

    (element.parentElement || element).appendChild(indicator);
  }

  private handleInput = debounce(async (event: Event) => {
    const element = event.target as HTMLElement;
    const text = this.getElementText(element);

    if (!text || text.length < 10) return; // Ignorer les textes trop courts

    this.currentTarget = element;
    await this.analyzeText(text, element);
  }, 1000);

  private handleFocus(event: Event) {
    const element = event.target as HTMLElement;
    this.currentTarget = element;

    // Mettre à jour l'indicateur
    const indicator = element.parentElement?.querySelector(
      ".tonefixer-indicator"
    ) as HTMLElement;
    if (indicator) {
      indicator.style.background = "#10b981";
      indicator.style.opacity = "1";
    }
  }

  private handleBlur(event: Event) {
    const element = event.target as HTMLElement;

    // Masquer le widget après un délai
    setTimeout(() => {
      if (this.currentTarget === element) {
        this.hideWidget();
      }
    }, 300);

    // Restaurer l'indicateur
    const indicator = element.parentElement?.querySelector(
      ".tonefixer-indicator"
    ) as HTMLElement;
    if (indicator) {
      indicator.style.background = "#3b82f6";
      indicator.style.opacity = "0.7";
    }
  }

  private getElementText(element: HTMLElement): string {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      return element.value;
    } else if (element.contentEditable === "true") {
      return element.textContent || "";
    }
    return "";
  }

  private async analyzeText(text: string, element: HTMLElement) {
    // Vérifier le cache
    const cacheKey = text.trim().toLowerCase();
    const cachedAnalysis = this.analysisCache.get(cacheKey);
    if (cachedAnalysis) {
      this.showAnalysis(cachedAnalysis, element);
      return;
    }

    // Vérifier la configuration
    if (!this.preferences?.apiKey) {
      console.log("ToneFixer: Clé API manquante");
      return;
    }

    try {
      // Construire le contexte manuellement
      const platform = PlatformDetector.detectPlatform();
      const context = {
        platform,
        messageType: "email",
        relationship: "professional",
        formality: "semi-formal",
        urgency: "medium",
        language: "fr",
        threadContext: undefined,
        recipientContext: undefined,
      };

      // Analyser avec l'IA via le background script
      const response = await this.sendMessage({
        type: "ANALYZE_TEXT",
        text,
        context,
      });

      if (response?.analysis) {
        const analysis = response.analysis;

        // Mettre en cache
        this.analysisCache.set(cacheKey, analysis); // Limiter la taille du cache
        if (this.analysisCache.size > 50) {
          const firstKey = this.analysisCache.keys().next().value;
          if (firstKey) {
            this.analysisCache.delete(firstKey);
          }
        }

        // Afficher l'analyse
        this.showAnalysis(analysis, element);
      }
    } catch (error) {
      console.error("ToneFixer: Erreur d'analyse:", error);
    }
  }

  private sendMessage(message: ChromeMessage): Promise<any> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  private showAnalysis(analysis: ToneAnalysis, element: HTMLElement) {
    // Ne montrer le widget que si il y a des problèmes ou des suggestions
    if (analysis.issues.length === 0 && analysis.suggestions.length === 0) {
      this.updateIndicator(element, "good");
      return;
    }

    // Déterminer la couleur de l'indicateur
    if (analysis.level === "problematic" || analysis.level === "poor") {
      this.updateIndicator(element, "error");
    } else if (analysis.level === "fair") {
      this.updateIndicator(element, "warning");
    } else {
      this.updateIndicator(element, "good");
    }

    // Positionner et afficher le widget
    const position = getPositionInViewport(element);
    this.showWidget(position, analysis);

    // Notifier le widget du nouvel élément cible
    if (
      typeof window !== "undefined" &&
      (window as any).tonefixerRenderWidget
    ) {
      (window as any).tonefixerRenderWidget(element);
    }
  }

  private showWidget(
    position: { x: number; y: number },
    analysis: ToneAnalysis
  ) {
    // Envoyer les données au widget via un event customisé
    const event = new CustomEvent("tonefixer-show-analysis", {
      detail: { position, analysis },
    });
    document.dispatchEvent(event);
  }

  private hideWidget() {
    const event = new CustomEvent("tonefixer-hide-widget");
    document.dispatchEvent(event);
  }

  private updateIndicator(
    element: HTMLElement,
    status: "good" | "warning" | "error"
  ) {
    const indicator = element.parentElement?.querySelector(
      ".tonefixer-indicator"
    ) as HTMLElement;
    if (indicator) {
      const colors = {
        good: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
      };
      indicator.style.background = colors[status];
      indicator.style.opacity = "1";
    }
  }

  // Méthodes publiques pour les messages Chrome
  public toggleExtension() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.hideWidget();
    }
  }

  public updatePreferences(preferences: UserPreferences) {
    this.preferences = preferences;
  }
}

// Initialiser le script de contenu
let contentScript: ToneFixerContentScript | null = null;

// Attendre que le DOM soit prêt
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    contentScript = new ToneFixerContentScript();
  });
} else {
  contentScript = new ToneFixerContentScript();
}

// Gérer les messages du background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "TOGGLE_EXTENSION":
      if (contentScript) {
        contentScript.toggleExtension();
      }
      sendResponse({ success: true });
      break;

    case "UPDATE_PREFERENCES":
      if (contentScript && message.preferences) {
        contentScript.updatePreferences(message.preferences);
      }
      sendResponse({ success: true });
      break;

    case "GET_PAGE_INFO":
      sendResponse({
        platform: PlatformDetector.detectPlatform(),
        url: window.location.href,
        title: document.title,
      });
      break;

    case "EXTENSION_TOGGLED":
      if (contentScript) {
        contentScript.toggleExtension();
      }
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: "Unknown message type" });
  }

  return true; // Indique une réponse asynchrone
});

// Nettoyer lors du déchargement
window.addEventListener("beforeunload", () => {
  if (contentScript) {
    // Nettoyer les observateurs et cache
  }
});

export { ToneFixerContentScript };
