#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 ToneFixer Extension - Final Verification");
console.log("=".repeat(50));

const distPath = path.join(__dirname, "..", "dist");
const requiredFiles = [
  "manifest.json",
  "background.js",
  "content.js",
  "popup.html",
  "popup.js",
  "widget.html",
  "widget.js",
  "content.css",
  "icons/icon16.png",
  "icons/icon32.png",
  "icons/icon48.png",
  "icons/icon128.png",
];

let allGood = true;

console.log("\n📁 Checking required files...");
requiredFiles.forEach((file) => {
  const filePath = path.join(distPath, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? "✅" : "❌";
  console.log(`${status} ${file}`);
  if (!exists) allGood = false;
});

console.log("\n📊 Bundle sizes:");
const bundleFiles = ["background.js", "content.js", "popup.js", "widget.js"];
bundleFiles.forEach((file) => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`📦 ${file}: ${sizeKB} KB`);
  }
});

console.log("\n🔧 Manifest validation...");
try {
  const manifestPath = path.join(distPath, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const requiredFields = [
    "manifest_version",
    "name",
    "version",
    "permissions",
    "background",
    "content_scripts",
    "action",
  ];
  requiredFields.forEach((field) => {
    const exists = manifest.hasOwnProperty(field);
    const status = exists ? "✅" : "❌";
    console.log(`${status} ${field}`);
    if (!exists) allGood = false;
  });

  console.log(`📋 Extension name: ${manifest.name}`);
  console.log(`🏷️  Version: ${manifest.version}`);
  console.log(`🔐 Permissions: ${manifest.permissions.join(", ")}`);
} catch (error) {
  console.log("❌ Error reading manifest:", error.message);
  allGood = false;
}

console.log("\n" + "=".repeat(50));
if (allGood) {
  console.log("🎉 SUCCESS! Extension is ready for installation");
  console.log("");
  console.log("📋 Next steps:");
  console.log("1. Open Chrome and go to chrome://extensions/");
  console.log("2. Enable Developer Mode");
  console.log('3. Click "Load unpacked" and select the dist folder');
  console.log("4. Configure your AI API key in extension settings");
  console.log("5. Test on supported platforms (Gmail, Slack, etc.)");
  console.log("");
  console.log("📖 See INSTALLATION_GUIDE.md for detailed instructions");
} else {
  console.log("❌ FAILED! Some required files are missing");
  console.log('Run "npm run build" to rebuild the extension');
}

console.log("=".repeat(50));
