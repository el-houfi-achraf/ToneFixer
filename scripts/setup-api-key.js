#!/usr/bin/env node

/**
 * ToneFixer API Key Setup Helper
 * This script helps validate and test the provided API key
 */

const fetch = require("node-fetch");

const GEMINI_API_KEY = "AIzaSyBcixvKdxO0Nc9UxF6OJIUu7Qjff6h4xgo";

async function validateGeminiKey(apiKey) {
  console.log("🔑 Validating Gemini API key...");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API key is valid!");
      console.log(`📊 Available models: ${data.models?.length || 0}`);
      return true;
    } else {
      console.log(
        `❌ API key validation failed: ${response.status} ${response.statusText}`
      );
      return false;
    }
  } catch (error) {
    console.log(`❌ Error validating API key: ${error.message}`);
    return false;
  }
}

async function testAnalysis(apiKey) {
  console.log("\n🧪 Testing AI analysis...");

  const testText =
    "Hey, can you get this done ASAP? This is really urgent and I need it now.";
  const prompt = `Analyze the tone of this message and provide feedback in JSON format:
"${testText}"

Return only valid JSON with this structure:
{
  "score": number (0-100),
  "level": "excellent" | "good" | "fair" | "poor" | "problematic",
  "confidence": number (0-1),
  "issues": [],
  "suggestions": []
}`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
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
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const analysisText = data.candidates[0]?.content?.parts[0]?.text;

      if (analysisText) {
        console.log("✅ AI analysis test successful!");
        console.log(
          "📝 Sample analysis:",
          analysisText.substring(0, 200) + "..."
        );
        return true;
      } else {
        console.log("❌ No analysis text received");
        return false;
      }
    } else {
      console.log(`❌ Analysis test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing analysis: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🚀 ToneFixer API Key Setup");
  console.log("=" * 40);
  console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 10)}...`);

  const isValid = await validateGeminiKey(GEMINI_API_KEY);

  if (isValid) {
    const analysisWorks = await testAnalysis(GEMINI_API_KEY);

    if (analysisWorks) {
      console.log("\n🎉 Setup Complete!");
      console.log("📋 Next steps:");
      console.log("1. Load the extension in Chrome (chrome://extensions/)");
      console.log("2. Open the extension popup");
      console.log("3. Go to Settings and enter this API key:");
      console.log(`   ${GEMINI_API_KEY}`);
      console.log("4. Select 'Gemini' as your AI provider");
      console.log("5. Test on Gmail, Slack, or LinkedIn!");
    } else {
      console.log("\n⚠️  API key is valid but analysis failed");
      console.log("This might be a temporary issue. Try again later.");
    }
  } else {
    console.log("\n❌ Setup failed - API key is not valid");
  }

  console.log("\n📚 For troubleshooting, see INSTALLATION_GUIDE.md");
}

main().catch(console.error);
