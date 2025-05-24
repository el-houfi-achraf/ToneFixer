#!/usr/bin/env node

/**
 * Script de diagnostic ToneFixer
 * Vérifie l'état de l'extension et aide au dépannage
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 ToneFixer - Diagnostic de l'Extension\n");
console.log("=" * 50);

// Vérifier les fichiers essentiels
const essentialFiles = [
  "dist/manifest.json",
  "dist/background.js",
  "dist/content.js",
  "dist/popup.js",
  "dist/widget.js",
  "dist/popup.html",
  "dist/widget.html",
  "dist/content.css",
];

console.log("📂 Vérification des fichiers...");
let allFilesPresent = true;

essentialFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? "✅" : "❌"} ${file}`);
  if (!exists) allFilesPresent = false;
});

if (!allFilesPresent) {
  console.log("\n❌ Certains fichiers manquent. Exécutez: npm run build");
  process.exit(1);
}

// Vérifier le manifest
console.log("\n📋 Vérification du manifest...");
try {
  const manifest = JSON.parse(fs.readFileSync("dist/manifest.json", "utf8"));
  console.log(`✅ Version: ${manifest.version}`);
  console.log(`✅ Nom: ${manifest.name}`);
  console.log(`✅ Permissions: ${manifest.permissions?.length || 0}`);
  console.log(`✅ Content Scripts: ${manifest.content_scripts?.length || 0}`);
  console.log(`✅ Host Permissions: ${manifest.host_permissions?.length || 0}`);

  if (manifest.host_permissions?.includes("file://*/*")) {
    console.log("✅ Support des fichiers locaux activé");
  } else {
    console.log("⚠️  Support des fichiers locaux manquant");
  }
} catch (error) {
  console.log(`❌ Erreur de lecture du manifest: ${error.message}`);
}

// Vérifier les tailles de fichiers
console.log("\n📊 Tailles des fichiers...");
const fileSizes = [
  "dist/background.js",
  "dist/content.js",
  "dist/popup.js",
  "dist/widget.js",
].map((file) => {
  const stats = fs.statSync(file);
  const sizeKB = Math.round(stats.size / 1024);
  return { file: path.basename(file), size: sizeKB };
});

fileSizes.forEach(({ file, size }) => {
  const status = size > 0 ? "✅" : "❌";
  console.log(`${status} ${file}: ${size} KB`);
});

// Instructions de test
console.log("\n🎯 Instructions de Test:");
console.log("1. Aller à chrome://extensions/");
console.log('2. Activer "Mode développeur"');
console.log('3. Cliquer "Charger l\'extension non empaquetée"');
console.log('4. Sélectionner le dossier "dist"');
console.log(
  "5. Configurer la clé API: AIzaSyBcixvKdxO0Nc9UxF6OJIUu7Qjff6h4xgo"
);

console.log("\n🧪 Sites de Test Recommandés:");
console.log("- Gmail: https://mail.google.com");
console.log("- Google: https://google.com");
console.log("- Page locale: ouvrir test-page.html");

console.log('\n🔧 En cas de "Plateforme désactivée":');
console.log("1. Recharger l'extension (↻ sur chrome://extensions/)");
console.log("2. Rafraîchir la page web");
console.log("3. Vérifier la console (F12) pour les messages ToneFixer");
console.log("4. Tester sur test-page.html d'abord");

console.log("\n✅ Diagnostic terminé. Extension prête à installer!");
console.log("📚 Voir TROUBLESHOOTING.md pour plus d'aide.");
