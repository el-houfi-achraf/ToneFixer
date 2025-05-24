import React, { useState } from "react";
import {
  Settings,
  Eye,
  EyeOff,
  Key,
  Zap,
  Bell,
  User,
  BarChart3,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import type { UserPreferences } from "@/types";

export const SettingsPanel: React.FC = () => {
  const { preferences, updatePreferences, analytics } = useAppStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "api" | "advanced" | "analytics"
  >("general");

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    updatePreferences({ [key]: value });
  };

  const tabs = [
    { id: "general", label: "Général", icon: Settings },
    { id: "api", label: "API", icon: Key },
    { id: "advanced", label: "Avancé", icon: Zap },
    { id: "analytics", label: "Statistiques", icon: BarChart3 },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
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

      <div className="p-6">
        {/* Onglet Général */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Préférences Générales
            </h2>

            {/* Mode automatique */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mode automatique
                </label>
                <p className="text-xs text-gray-500">
                  Analyse automatique pendant la frappe
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoMode}
                onChange={(e) =>
                  handlePreferenceChange("autoMode", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Sensibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sensibilité ({preferences.sensitivity}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={preferences.sensitivity}
                onChange={(e) =>
                  handlePreferenceChange(
                    "sensitivity",
                    parseInt(e.target.value)
                  )
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Moins sensible</span>
                <span>Plus sensible</span>
              </div>
            </div>

            {/* Niveau de formalité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de formalité préféré
              </label>
              <select
                value={preferences.formalityPreference}
                onChange={(e) =>
                  handlePreferenceChange("formalityPreference", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="very-formal">Très formel</option>
                <option value="formal">Formel</option>
                <option value="semi-formal">Semi-formel</option>
                <option value="casual">Décontracté</option>
                <option value="informal">Informel</option>
              </select>
            </div>

            {/* Style personnel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style personnel
              </label>
              <select
                value={preferences.personalStyle}
                onChange={(e) =>
                  handlePreferenceChange("personalStyle", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="concise">Concis</option>
                <option value="detailed">Détaillé</option>
                <option value="friendly">Amical</option>
                <option value="professional">Professionnel</option>
                <option value="creative">Créatif</option>
                <option value="analytical">Analytique</option>
              </select>
            </div>

            {/* Plateformes activées */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plateformes activées
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "gmail",
                  "slack",
                  "linkedin",
                  "github",
                  "discord",
                  "teams",
                ].map((platform) => (
                  <label key={platform} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.enabledPlatforms.includes(
                        platform as any
                      )}
                      onChange={(e) => {
                        const platforms = e.target.checked
                          ? [...preferences.enabledPlatforms, platform as any]
                          : preferences.enabledPlatforms.filter(
                              (p) => p !== platform
                            );
                        handlePreferenceChange("enabledPlatforms", platforms);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {platform}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet API */}
        {activeTab === "api" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Configuration API
            </h2>
            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur d'IA
              </label>
              <select
                value={preferences.provider}
                onChange={(e) =>
                  handlePreferenceChange("provider", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gemini">Google Gemini Pro</option>
                <option value="claude">Anthropic Claude 3.5 Sonnet</option>
              </select>
            </div>{" "}
            {/* Clé API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={preferences.apiKey}
                  onChange={(e) =>
                    handlePreferenceChange("apiKey", e.target.value)
                  }
                  placeholder="Entrez votre clé API..."
                  className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {preferences.provider === "gemini"
                    ? "Obtenez votre clé sur Google AI Studio"
                    : "Obtenez votre clé sur Anthropic Console"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    updatePreferences({ apiKey: preferences.apiKey });
                    // Envoyer un message au background script pour tester la clé
                    chrome.runtime.sendMessage(
                      { type: "VALIDATE_API_KEY" },
                      (response) => {
                        if (response?.success) {
                          alert("Clé API enregistrée avec succès !");
                        }
                      }
                    );
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
            {/* Instructions de sécurité */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Sécurité
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Votre clé API est stockée localement et chiffrée. Elle n'est
                    jamais partagée avec des tiers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Avancé */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Paramètres Avancés
            </h2>

            {/* Notifications */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Afficher les info-bulles
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.showTooltips}
                    onChange={(e) =>
                      handlePreferenceChange("notifications", {
                        ...preferences.notifications,
                        showTooltips: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Afficher les badges
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.showBadges}
                    onChange={(e) =>
                      handlePreferenceChange("notifications", {
                        ...preferences.notifications,
                        showBadges: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sons activés</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.soundEnabled}
                    onChange={(e) =>
                      handlePreferenceChange("notifications", {
                        ...preferences.notifications,
                        soundEnabled: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Mots blacklistés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mots à ignorer (séparés par des virgules)
              </label>
              <textarea
                value={preferences.blacklistedWords.join(", ")}
                onChange={(e) => {
                  const words = e.target.value
                    .split(",")
                    .map((w) => w.trim())
                    .filter((w) => w);
                  handlePreferenceChange("blacklistedWords", words);
                }}
                placeholder="ex: nom propre, jargon technique, etc."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Onglet Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Statistiques d'Utilisation
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.suggestionsGenerated}
                </div>
                <div className="text-sm text-blue-700">
                  Suggestions générées
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.suggestionsAccepted}
                </div>
                <div className="text-sm text-green-700">
                  Suggestions acceptées
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analytics.userSatisfactionScore * 20)}%
                </div>
                <div className="text-sm text-purple-700">Satisfaction</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.timesSaved}min
                </div>
                <div className="text-sm text-orange-700">Temps économisé</div>
              </div>
            </div>

            {/* Utilisation par plateforme */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Utilisation par plateforme
              </h3>
              <div className="space-y-2">
                {Object.entries(analytics.platformUsage).map(
                  ([platform, count]) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 capitalize">
                        {platform}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
