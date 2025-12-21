import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function svgToIco() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Read SVG content
  const svgContent = readFileSync(join(rootDir, 'favicon.svg'), 'utf-8');

  // Create HTML page with SVG rendered on canvas
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;">
      <canvas id="canvas" width="32" height="32"></canvas>
      <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 32, 32);
          window.pngData = canvas.toDataURL('image/png');
        };
        img.src = 'data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}';
      </script>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForFunction(() => window.pngData);

  // Get PNG data
  const pngDataUrl = await page.evaluate(() => window.pngData);
  const pngBuffer = Buffer.from(pngDataUrl.split(',')[1], 'base64');

  // Create ICO file (simple single-image ICO format)
  const icoBuffer = createIco(pngBuffer, 32, 32);

  writeFileSync(join(rootDir, 'favicon.ico'), icoBuffer);
  writeFileSync(join(rootDir, 'dist', 'favicon.ico'), icoBuffer);

  console.log('Created favicon.ico (32x32)');

  await browser.close();
}

function createIco(pngBuffer, width, height) {
  // ICO header: 6 bytes
  // Image directory entry: 16 bytes per image
  // PNG data follows

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(1, 4); // Number of images

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width === 256 ? 0 : width, 0); // Width
  dirEntry.writeUInt8(height === 256 ? 0 : height, 1); // Height
  dirEntry.writeUInt8(0, 2); // Color palette
  dirEntry.writeUInt8(0, 3); // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Image size
  dirEntry.writeUInt32LE(22, 12); // Image offset (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

svgToIco().catch(console.error);
