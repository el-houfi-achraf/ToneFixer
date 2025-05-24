import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ToneAnalysisDisplay } from "@/components/ToneAnalysisDisplay";
import type { ToneAnalysis, ToneSuggestion } from "@/types";
import "@/styles/globals.css";

interface WidgetProps {
  targetElement?: HTMLElement;
}

interface WidgetState {
  analysis: ToneAnalysis | null;
  position: { x: number; y: number };
  isVisible: boolean;
}

const Widget: React.FC<WidgetProps> = ({ targetElement }) => {
  const [state, setState] = useState<WidgetState>({
    analysis: null,
    position: { x: 0, y: 0 },
    isVisible: false,
  });

  useEffect(() => {
    // Écouter les événements du content script
    const handleShowAnalysis = (event: CustomEvent) => {
      const { position, analysis } = event.detail;
      setState({
        analysis,
        position,
        isVisible: true,
      });
    };

    const handleHideWidget = () => {
      setState((prev) => ({ ...prev, isVisible: false }));
    };

    document.addEventListener(
      "tonefixer-show-analysis",
      handleShowAnalysis as EventListener
    );
    document.addEventListener("tonefixer-hide-widget", handleHideWidget);

    return () => {
      document.removeEventListener(
        "tonefixer-show-analysis",
        handleShowAnalysis as EventListener
      );
      document.removeEventListener("tonefixer-hide-widget", handleHideWidget);
    };
  }, []);

  const handleApplySuggestion = (suggestion: ToneSuggestion) => {
    if (
      (targetElement && targetElement.tagName === "INPUT") ||
      targetElement?.tagName === "TEXTAREA"
    ) {
      const input = targetElement as HTMLInputElement | HTMLTextAreaElement;
      const currentValue = input.value;
      const newValue = currentValue.replace(
        suggestion.original,
        suggestion.improved
      );

      // Mise à jour de la valeur
      input.value = newValue;

      // Déclencher les événements pour que les frameworks détectent le changement
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      // Focus sur l'élément
      input.focus();

      // Envoyer feedback au background script
      chrome.runtime.sendMessage({
        type: "RECORD_FEEDBACK",
        feedback: {
          suggestionId: suggestion.id,
          rating: 5,
          helpful: true,
          timestamp: Date.now(),
          context: state.analysis?.context,
        },
      });
    } else if (targetElement && targetElement.contentEditable === "true") {
      // Gestion des éléments contentEditable
      const currentText = targetElement.textContent || "";
      const newText = currentText.replace(
        suggestion.original,
        suggestion.improved
      );
      targetElement.textContent = newText;

      // Déclencher l'événement input
      targetElement.dispatchEvent(new Event("input", { bubbles: true }));

      chrome.runtime.sendMessage({
        type: "RECORD_FEEDBACK",
        feedback: {
          suggestionId: suggestion.id,
          rating: 5,
          helpful: true,
          timestamp: Date.now(),
          context: state.analysis?.context,
        },
      });
    }

    setState((prev) => ({ ...prev, isVisible: false }));
  };

  const handleFeedback = (suggestionId: string, helpful: boolean) => {
    chrome.runtime.sendMessage({
      type: "RECORD_FEEDBACK",
      feedback: {
        suggestionId,
        rating: helpful ? 4 : 2,
        helpful,
        timestamp: Date.now(),
        context: state.analysis?.context,
      },
    });
  };

  const handleClose = () => {
    setState((prev) => ({ ...prev, isVisible: false }));
  };

  if (!state.isVisible || !state.analysis) {
    return null;
  }

  return (
    <div
      className="tonefixer-widget animate-fade-in"
      style={{
        left: Math.max(
          10,
          Math.min(state.position.x - 150, window.innerWidth - 320)
        ),
        top: Math.max(10, state.position.y + 10),
        maxWidth: "300px",
        position: "fixed",
        zIndex: 2147483647,
        pointerEvents: "auto",
      }}
    >
      <div className="relative">
        {/* Flèche pointant vers l'élément */}
        <div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"
          style={{ filter: "drop-shadow(0 -2px 4px rgba(0,0,0,0.1))" }}
        />

        {/* Widget principal */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200">
          <ToneAnalysisDisplay
            analysis={state.analysis}
            onApplySuggestion={handleApplySuggestion}
            onFeedback={handleFeedback}
          />

          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white rounded-full text-xs hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Point d'entrée du widget
export function initWidget() {
  // Créer le conteneur s'il n'existe pas
  let container = document.getElementById("tonefixer-widget-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "tonefixer-widget-container";
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483647;
    `;
    document.body.appendChild(container);
  }

  // Créer la racine React
  const root = createRoot(container);

  // Fonction pour rendre le widget avec l'élément cible
  (window as any).tonefixerRenderWidget = (targetElement?: HTMLElement) => {
    root.render(<Widget targetElement={targetElement} />);
  };

  // Rendu initial
  root.render(<Widget />);
}

// Auto-initialisation
if (typeof window !== "undefined") {
  initWidget();
}
