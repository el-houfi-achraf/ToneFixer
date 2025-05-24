import React from "react";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import {
  getToneColor,
  getIssueColor,
  calculateConfidenceColor,
} from "@/utils/helpers";
import type { ToneAnalysis, ToneSuggestion } from "@/types";

interface ToneAnalysisDisplayProps {
  analysis: ToneAnalysis;
  onApplySuggestion: (suggestion: ToneSuggestion) => void;
  onFeedback: (suggestionId: string, helpful: boolean) => void;
  compact?: boolean;
}

export const ToneAnalysisDisplay: React.FC<ToneAnalysisDisplayProps> = ({
  analysis,
  onApplySuggestion,
  onFeedback,
  compact = false,
}) => {
  const getToneIcon = () => {
    switch (analysis.level) {
      case "excellent":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "good":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "fair":
        return <Info className="w-5 h-5 text-yellow-600" />;
      case "poor":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "problematic":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (compact) {
    return (
      <div
        className={`flex items-center space-x-2 p-2 rounded-lg border ${getToneColor(
          analysis.level
        )}`}
      >
        {getToneIcon()}
        <span className="text-sm font-medium">
          Score:{" "}
          <span className={getScoreColor(analysis.score)}>
            {analysis.score}/100
          </span>
        </span>
        <span className="text-xs text-gray-500">
          {analysis.suggestions.length} suggestion
          {analysis.suggestions.length > 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
      {/* Header */}
      <div
        className={`p-4 rounded-t-lg border-b ${getToneColor(analysis.level)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getToneIcon()}
            <h3 className="font-semibold">Analyse du Ton</h3>
          </div>
          <div className="text-right">
            <div
              className={`text-lg font-bold ${getScoreColor(analysis.score)}`}
            >
              {analysis.score}/100
            </div>
            <div
              className={`text-xs ${calculateConfidenceColor(
                analysis.confidence
              )}`}
            >
              Confiance: {Math.round(analysis.confidence * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <h4 className="font-medium text-gray-800 mb-2">Problèmes détectés</h4>
          <div className="space-y-2">
            {analysis.issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-2 rounded text-xs border ${getIssueColor(
                  issue.type,
                  issue.severity
                )}`}
              >
                <div className="font-medium capitalize">
                  {issue.type.replace("-", " ")} ({issue.severity})
                </div>
                <div className="mt-1">{issue.description}</div>
                {issue.text && (
                  <div className="mt-1 italic">"{issue.text}"</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="p-4">
          <h4 className="font-medium text-gray-800 mb-3">
            Suggestions d'amélioration
          </h4>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 uppercase">
                    {suggestion.type.replace("-", " ")}
                  </span>
                  <span
                    className={`text-xs ${calculateConfidenceColor(
                      suggestion.confidence
                    )}`}
                  >
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-red-600">Original:</span>
                    <div className="text-gray-700 italic">
                      "{suggestion.original}"
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-green-600">
                      Amélioré:
                    </span>
                    <div className="text-gray-800 bg-green-50 p-2 rounded border">
                      "{suggestion.improved}"
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    <strong>Pourquoi:</strong> {suggestion.explanation}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => onApplySuggestion(suggestion)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Appliquer
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onFeedback(suggestion.id, true)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Utile"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => onFeedback(suggestion.id, false)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Pas utile"
                    >
                      👎
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 rounded-b-lg text-xs text-gray-500 flex items-center justify-between">
        <span>Plateforme: {analysis.context.platform}</span>
        <span>Analysé en {analysis.processingTime}ms</span>
      </div>
    </div>
  );
};
