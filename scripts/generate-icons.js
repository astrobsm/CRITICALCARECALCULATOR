/**
 * Icon Generator for PWA
 * Generates properly sized icons from logo.png
 * Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-128.png', size: 128 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-384.png', size: 384 },
  { name: 'icon-512.png', size: 512 }
];

const inputPath = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    // Check if sharp is installed
    if (!fs.existsSync(inputPath)) {
      console.error('❌ logo.png not found in public folder');
      process.exit(1);
    }

    console.log('🎨 Generating PWA icons...\n');

    for (const { name, size } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 2, g: 132, b: 199, alpha: 1 } // #0284c7 theme color
        })
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`✅ ${name} - ${size}x${size} - ${(stats.size / 1024).toFixed(2)}KB`);
    }

    console.log('\n✨ All icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Sharp package not found. Installing...');
      console.log('Run: npm install --save-dev sharp');
      process.exit(1);
    }
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
