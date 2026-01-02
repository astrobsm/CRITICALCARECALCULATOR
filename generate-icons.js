const fs = require('fs');
const path = require('path');

// Simple PNG generator for placeholder icons
// This creates basic PNG files that can be used as placeholders

const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple 1x1 blue PNG as base
function createPlaceholderPNG(size) {
  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const width = size;
  const height = size;
  const bitDepth = 8;
  const colorType = 2; // RGB
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(bitDepth, 8);
  ihdrData.writeUInt8(colorType, 9);
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT chunk - create blue image with medical cross
  const rawData = [];
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const crossWidth = Math.floor(width * 0.2);
  const crossHeight = Math.floor(height * 0.6);
  
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      // Check if pixel is in cross
      const inVerticalBar = x >= cx - crossWidth/2 && x <= cx + crossWidth/2 && 
                           y >= cy - crossHeight/2 && y <= cy + crossHeight/2;
      const inHorizontalBar = y >= cy - crossWidth/2 && y <= cy + crossWidth/2 && 
                             x >= cx - crossHeight/2 && x <= cx + crossHeight/2;
      
      if (inVerticalBar || inHorizontalBar) {
        // White cross
        rawData.push(255, 255, 255);
      } else {
        // Blue background (#0284c7)
        rawData.push(2, 132, 199);
      }
    }
  }
  
  const rawBuffer = Buffer.from(rawData);
  
  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawBuffer);
  
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  const table = makeCRCTable();
  
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xFF];
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCRCTable() {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c >>> 0;
  }
  return table;
}

// Generate icons
const publicDir = path.join(__dirname, 'public');

sizes.forEach(size => {
  const png = createPlaceholderPNG(size);
  const filename = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename}`);
});

// Create logo.png (same as icon-192)
const logoPng = createPlaceholderPNG(192);
fs.writeFileSync(path.join(publicDir, 'logo.png'), logoPng);
console.log('Created logo.png');

console.log('All icons generated successfully!');
