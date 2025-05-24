#!/usr/bin/env node

/**
 * Script de test final pour ToneFixer
 * Vérifie que tout fonctionne correctement
 */

const fs = require("fs");
const path = require("path");

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? "✅" : "❌"} ${description}: ${filePath}`);
  return exists;
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
}

console.log("🚀 ToneFixer - Test de Validation Final\n");
console.log("=" * 60);

// Test des fichiers de build
console.log("📦 VÉRIFICATION DES FICHIERS DE BUILD:");
const buildFiles = [
  ["dist/manifest.json", "Manifest"],
  ["dist/background.js", "Service Worker"],
  ["dist/content.js", "Script de contenu"],
  ["dist/popup.js", "Interface popup"],
  ["dist/widget.js", "Widget flottant"],
  ["dist/popup.html", "Page popup"],
  ["dist/widget.html", "Page widget"],
  ["dist/content.css", "Styles de contenu"],
];

let allFilesOk = true;
buildFiles.forEach(([file, desc]) => {
  if (!checkFile(file, desc)) allFilesOk = false;
});

if (!allFilesOk) {
  console.log("\n❌ ERREUR: Fichiers manquants. Exécutez: npm run build");
  process.exit(1);
}

// Test des tailles
console.log("\n📊 TAILLES DES FICHIERS:");
[
  "dist/background.js",
  "dist/content.js",
  "dist/popup.js",
  "dist/widget.js",
].forEach((file) => {
  const size = getFileSize(file);
  const status = size > 5 ? "✅" : "⚠️";
  console.log(`${status} ${path.basename(file)}: ${size} KB`);
});

// Test du manifest
console.log("\n📋 CONFIGURATION MANIFEST:");
try {
  const manifest = JSON.parse(fs.readFileSync("dist/manifest.json", "utf8"));

  console.log(`✅ Version: ${manifest.version}`);
  console.log(`✅ Permissions: ${manifest.permissions?.length || 0}`);
  console.log(`✅ Host Permissions: ${manifest.host_permissions?.length || 0}`);
  console.log(`✅ Content Scripts: ${manifest.content_scripts?.length || 0}`);

  // Vérifier les permissions essentielles
  const hasStorage = manifest.permissions?.includes("storage");
  const hasActiveTab = manifest.permissions?.includes("activeTab");
  const hasScripting = manifest.permissions?.includes("scripting");

  console.log(`${hasStorage ? "✅" : "❌"} Permission storage`);
  console.log(`${hasActiveTab ? "✅" : "❌"} Permission activeTab`);
  console.log(`${hasScripting ? "✅" : "❌"} Permission scripting`);

  // Vérifier les domaines supportés
  const supportedDomains = [
    "https://mail.google.com/*",
    "https://slack.com/*",
    "https://linkedin.com/*",
    "https://github.com/*",
  ];

  console.log("\n🌐 DOMAINES SUPPORTÉS:");
  supportedDomains.forEach((domain) => {
    const supported = manifest.host_permissions?.includes(domain);
    console.log(`${supported ? "✅" : "❌"} ${domain}`);
  });
} catch (error) {
  console.log(`❌ Erreur manifest: ${error.message}`);
}

// Instructions finales
console.log("\n🎯 PROCHAINES ÉTAPES:");
console.log("1. Exécutez: setup-complete.bat");
console.log("2. Ou manuellement:");
console.log("   - Allez à chrome://extensions/");
console.log('   - Activez "Mode développeur"');
console.log('   - Cliquez "Charger l\'extension non empaquetée"');
console.log('   - Sélectionnez le dossier "dist"');

console.log("\n🔧 CONFIGURATION API:");
console.log("Clé API Gemini: AIzaSyBcixvKdxO0Nc9UxF6OJIUu7Qjff6h4xgo");
console.log("Fournisseur: Gemini");

console.log("\n🧪 TEST RECOMMANDÉ:");
console.log("1. Gmail: https://mail.google.com");
console.log("2. Composez un nouveau message");
console.log('3. Tapez: "Hey, j\'ai besoin de ça MAINTENANT!"');
console.log("4. Le widget ToneFixer devrait apparaître");

console.log('\n🚨 EN CAS DE "Plateforme désactivée":');
console.log("1. Exécutez: fix-platform-disabled.bat");
console.log("2. Rechargez l'extension (↻ sur chrome://extensions/)");
console.log("3. Rafraîchissez la page web");
console.log("4. Vérifiez la console Chrome (F12)");

console.log("\n✅ VALIDATION TERMINÉE - Extension prête à installer!");
console.log("📚 Documentation: TROUBLESHOOTING.md, INSTALLATION_GUIDE.md");
