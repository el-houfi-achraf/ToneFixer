const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [16, 32, 48, 128];
const srcDir = path.join(__dirname, "..", "scripts", "src", "assets");
const destDir = path.join(__dirname, "..", "src", "assets");

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function convertIcons() {
  console.log("Converting SVG icons to PNG...");

  for (const size of sizes) {
    const svgPath = path.join(srcDir, `icon${size}.svg`);
    const pngPath = path.join(destDir, `icon${size}.png`);

    try {
      if (fs.existsSync(svgPath)) {
        await sharp(svgPath).png().resize(size, size).toFile(pngPath);

        console.log(`✓ Converted icon${size}.svg to icon${size}.png`);
      } else {
        console.log(`⚠ SVG file not found: ${svgPath}`);
      }
    } catch (error) {
      console.error(`✗ Error converting icon${size}.svg:`, error.message);
    }
  }

  console.log("Icon conversion completed!");
}

convertIcons().catch(console.error);
