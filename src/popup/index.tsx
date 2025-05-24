import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Settings,
  Activity,
  Zap,
  ZapOff,
  HelpCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useAppStore } from "@/stores/appStore";
import "@/styles/globals.css";

type TabType = "dashboard" | "settings" | "help";

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const { isEnabled, setEnabled, analytics, preferences, currentPlatform } =
    useAppStore();

  const [currentSite, setCurrentSite] = useState<string>("");

  useEffect(() => {
    // Obtenir l'onglet actuel
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        const url = new URL(tabs[0].url);
        setCurrentSite(url.hostname);
      }
    });
  }, []);

  const toggleExtension = () => {
    setEnabled(!isEnabled);
  };

  const getPlatformStatus = () => {
    if (!preferences.enabledPlatforms.includes(currentPlatform)) {
      return {
        status: "disabled",
        color: "text-gray-500",
        message: "Plateforme désactivée",
      };
    }
    if (!preferences.apiKey) {
      return {
        status: "config",
        color: "text-orange-500",
        message: "Configuration requise",
      };
    }
    if (isEnabled) {
      return { status: "active", color: "text-green-500", message: "Actif" };
    }
    return { status: "paused", color: "text-gray-500", message: "En pause" };
  };

  const platformStatus = getPlatformStatus();

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: Activity },
    { id: "settings", label: "Paramètres", icon: Settings },
    { id: "help", label: "Aide", icon: HelpCircle },
  ];

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ToneFixer</h1>
              <p className="text-xs text-gray-500">{currentSite}</p>
            </div>
          </div>

          <button
            onClick={toggleExtension}
            className={`p-2 rounded-lg transition-colors ${
              isEnabled
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={isEnabled ? "Désactiver" : "Activer"}
          >
            {isEnabled ? (
              <Zap className="w-5 h-5" />
            ) : (
              <ZapOff className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Status */}
        <div className="mt-3 flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              platformStatus.status === "active"
                ? "bg-green-500"
                : platformStatus.status === "config"
                ? "bg-orange-500"
                : "bg-gray-400"
            }`}
          />
          <span className={`text-sm ${platformStatus.color}`}>
            {platformStatus.message}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 px-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="p-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-600">Score moyen</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {analytics.suggestionsGenerated > 0
                    ? Math.round(analytics.userSatisfactionScore * 20)
                    : "--"}
                  %
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Améliorations</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {analytics.suggestionsAccepted}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">
                  Activité récente
                </h3>
              </div>
              <div className="p-3">
                {analytics.suggestionsGenerated === 0 ? (
                  <div className="text-center py-6">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Aucune activité récente
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Commencez à taper pour voir les suggestions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Suggestions générées</span>
                        <span className="font-medium">
                          {analytics.suggestionsGenerated}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Suggestions acceptées</span>
                        <span className="font-medium text-green-600">
                          {analytics.suggestionsAccepted}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Temps économisé</span>
                        <span className="font-medium text-blue-600">
                          {analytics.timesSaved}min
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Usage */}
            <div className="bg-white rounded-lg border">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">
                  Utilisation par plateforme
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {Object.entries(analytics.platformUsage)
                  .filter(([_, count]) => count > 0)
                  .map(([platform, count]) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600 capitalize">
                        {platform}
                      </span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                {Object.values(analytics.platformUsage).every(
                  (count) => count === 0
                ) && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Aucune utilisation enregistrée
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">
                  Actions rapides
                </h3>
              </div>
              <div className="p-3 space-y-2">
                <button
                  onClick={() => setActiveTab("settings")}
                  className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  disabled={!preferences.apiKey}
                >
                  {!preferences.apiKey
                    ? "Configurer l'API"
                    : "Modifier les paramètres"}
                </button>
                <button
                  onClick={() =>
                    chrome.tabs.create({
                      url: "https://github.com/tonefixer/docs",
                    })
                  }
                  className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                >
                  Voir la documentation
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-4">
            <SettingsPanel />
          </div>
        )}

        {activeTab === "help" && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Comment utiliser ToneFixer
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <p>Configurez votre clé API dans les paramètres</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <p>Tapez votre message sur une plateforme supportée</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <p>Recevez des suggestions d'amélioration en temps réel</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <p>Appliquez les suggestions d'un clic</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Plateformes supportées
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  "Gmail",
                  "Slack",
                  "LinkedIn",
                  "GitHub",
                  "Discord",
                  "Teams",
                ].map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-700">{platform}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Besoin d'aide ?
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    chrome.tabs.create({ url: "mailto:support@tonefixer.com" })
                  }
                  className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Contacter le support
                </button>
                <button
                  onClick={() =>
                    chrome.tabs.create({
                      url: "https://github.com/tonefixer/extension/issues",
                    })
                  }
                  className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Signaler un bug
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Initialisation
const container = document.getElementById("popup-root");
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
