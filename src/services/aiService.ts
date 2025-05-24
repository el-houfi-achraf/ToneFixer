import type { ToneAnalysis, MessageContext, UserPreferences } from "@/types";

export interface AIService {
  analyzeTone(
    text: string,
    context: MessageContext,
    preferences: UserPreferences
  ): Promise<ToneAnalysis>;
  name: string;
  isConfigured(preferences: UserPreferences): boolean;
}

export class GeminiService implements AIService {
  name = "Google Gemini Pro";

  isConfigured(preferences: UserPreferences): boolean {
    return !!preferences.apiKey && preferences.provider === "gemini";
  }

  async analyzeTone(
    text: string,
    context: MessageContext,
    preferences: UserPreferences
  ): Promise<ToneAnalysis> {
    const startTime = Date.now();

    if (!this.isConfigured(preferences)) {
      throw new Error("Gemini API key not configured");
    }

    const prompt = this.buildPrompt(text, context, preferences);

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
          preferences.apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.candidates[0]?.content?.parts[0]?.text;

      if (!analysisText) {
        throw new Error("No analysis received from Gemini");
      }

      const analysis = this.parseAnalysis(analysisText, text, context);
      analysis.processingTime = Date.now() - startTime;

      return analysis;
    } catch (error) {
      console.error("Gemini analysis error:", error);
      throw error;
    }
  }

  private buildPrompt(
    text: string,
    context: MessageContext,
    preferences: UserPreferences
  ): string {
    return `
Analysez le ton de ce message et fournissez des suggestions d'amélioration.

CONTEXTE:
- Plateforme: ${context.platform}
- Type de message: ${context.messageType}
- Relation: ${context.relationship}
- Niveau de formalité souhaité: ${preferences.formalityPreference}
- Style personnel: ${preferences.personalStyle}
- Langue: ${context.language}
- Urgence: ${context.urgency}

MESSAGE À ANALYSER:
"${text}"

INSTRUCTIONS:
1. Évaluez le ton sur une échelle de 0-100 (100 = excellent ton)
2. Identifiez les problèmes potentiels de ton
3. Proposez 3 versions améliorées du message
4. Expliquez pourquoi chaque suggestion est meilleure
5. Respectez le style personnel de l'utilisateur

RÉPONDEZ STRICTEMENT AU FORMAT JSON:
{
  "score": number,
  "level": "excellent" | "good" | "fair" | "poor" | "problematic",
  "confidence": number,
  "issues": [
    {
      "type": string,
      "severity": "low" | "medium" | "high",
      "text": string,
      "description": string,
      "position": {"start": number, "end": number},
      "risk": "low" | "medium" | "high"
    }
  ],
  "suggestions": [
    {
      "original": string,
      "improved": string,
      "type": "diplomatic" | "direct-cordial" | "empathetic",
      "explanation": string,
      "confidence": number,
      "position": {"start": number, "end": number}
    }
  ]
}`;
  }

  private parseAnalysis(
    analysisText: string,
    originalText: string,
    context: MessageContext
  ): ToneAnalysis {
    try {
      // Nettoyer le texte de réponse pour extraire le JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        score: parsed.score || 50,
        level: parsed.level || "fair",
        confidence: parsed.confidence || 0.7,
        issues: (parsed.issues || []).map((issue: any, index: number) => ({
          id: `issue-${index}`,
          type: issue.type || "unclear",
          severity: issue.severity || "medium",
          text: issue.text || "",
          description: issue.description || "",
          position: issue.position || { start: 0, end: originalText.length },
          risk: issue.risk || "medium",
        })),
        suggestions: (parsed.suggestions || []).map(
          (suggestion: any, index: number) => ({
            id: `suggestion-${index}`,
            original: suggestion.original || originalText,
            improved: suggestion.improved || originalText,
            type: suggestion.type || "diplomatic",
            explanation: suggestion.explanation || "",
            confidence: suggestion.confidence || 0.7,
            position: suggestion.position || {
              start: 0,
              end: originalText.length,
            },
          })
        ),
        context,
        processingTime: 0, // Will be set by caller
      };
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      throw new Error("Failed to parse AI response");
    }
  }
}

export class ClaudeService implements AIService {
  name = "Anthropic Claude 3.5 Sonnet";

  isConfigured(preferences: UserPreferences): boolean {
    return !!preferences.apiKey && preferences.provider === "claude";
  }

  async analyzeTone(
    text: string,
    context: MessageContext,
    preferences: UserPreferences
  ): Promise<ToneAnalysis> {
    const startTime = Date.now();

    if (!this.isConfigured(preferences)) {
      throw new Error("Claude API key not configured");
    }

    const prompt = this.buildPrompt(text, context, preferences);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": preferences.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2048,
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.content[0]?.text;

      if (!analysisText) {
        throw new Error("No analysis received from Claude");
      }

      const analysis = this.parseAnalysis(analysisText, text, context);
      analysis.processingTime = Date.now() - startTime;

      return analysis;
    } catch (error) {
      console.error("Claude analysis error:", error);
      throw error;
    }
  }

  private buildPrompt(
    text: string,
    context: MessageContext,
    preferences: UserPreferences
  ): string {
    return `
Analysez le ton de ce message et fournissez des suggestions d'amélioration spécifiques.

CONTEXTE DE COMMUNICATION:
- Plateforme: ${context.platform}
- Type de message: ${context.messageType}
- Relation professionnelle: ${context.relationship}
- Niveau de formalité souhaité: ${preferences.formalityPreference}
- Style personnel de l'utilisateur: ${preferences.personalStyle}
- Langue: ${context.language}
- Niveau d'urgence: ${context.urgency}

MESSAGE À ANALYSER:
"${text}"

MISSION:
1. Évaluez le ton global (score 0-100, où 100 = ton parfait)
2. Identifiez tous les problèmes de communication potentiels
3. Proposez exactement 3 améliorations différentes du message
4. Justifiez chaque suggestion avec une explication claire
5. Maintenez l'intention et le style personnel de l'auteur

RÉPONSE REQUISE EN JSON STRICT:
{
  "score": number,
  "level": "excellent" | "good" | "fair" | "poor" | "problematic",
  "confidence": number,
  "issues": [
    {
      "type": "aggressive" | "passive-aggressive" | "overly-formal" | "too-casual" | "unclear" | "potentially-offensive" | "micro-aggression" | "cultural-insensitive" | "emotional" | "demanding" | "dismissive",
      "severity": "low" | "medium" | "high",
      "text": "portion exacte du texte problématique",
      "description": "explication du problème",
      "position": {"start": number, "end": number},
      "risk": "low" | "medium" | "high"
    }
  ],
  "suggestions": [
    {
      "original": "texte original à remplacer",
      "improved": "version améliorée",
      "type": "diplomatic" | "direct-cordial" | "empathetic",
      "explanation": "pourquoi cette version est meilleure",
      "confidence": number,
      "position": {"start": number, "end": number}
    }
  ]
}`;
  }

  private parseAnalysis(
    analysisText: string,
    originalText: string,
    context: MessageContext
  ): ToneAnalysis {
    try {
      // Même logique de parsing que Gemini
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        score: parsed.score || 50,
        level: parsed.level || "fair",
        confidence: parsed.confidence || 0.7,
        issues: (parsed.issues || []).map((issue: any, index: number) => ({
          id: `issue-${index}`,
          type: issue.type || "unclear",
          severity: issue.severity || "medium",
          text: issue.text || "",
          description: issue.description || "",
          position: issue.position || { start: 0, end: originalText.length },
          risk: issue.risk || "medium",
        })),
        suggestions: (parsed.suggestions || []).map(
          (suggestion: any, index: number) => ({
            id: `suggestion-${index}`,
            original: suggestion.original || originalText,
            improved: suggestion.improved || originalText,
            type: suggestion.type || "diplomatic",
            explanation: suggestion.explanation || "",
            confidence: suggestion.confidence || 0.7,
            position: suggestion.position || {
              start: 0,
              end: originalText.length,
            },
          })
        ),
        context,
        processingTime: 0,
      };
    } catch (error) {
      console.error("Failed to parse Claude response:", error);
      throw new Error("Failed to parse AI response");
    }
  }
}

// Factory pour créer le service approprié
export function createAIService(preferences: UserPreferences): AIService {
  switch (preferences.provider) {
    case "claude":
      return new ClaudeService();
    case "gemini":
    default:
      return new GeminiService();
  }
}
