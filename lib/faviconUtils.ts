/**
 * Favicon Generation Utilities running client-side
 * Produces valid multi-resolution .ico binaries, PNG variants, and PWA manifests.
 */
import { createCanvas } from "./canvasUtils";
import { loadImage } from "./fileUtils";

export interface FaviconVariant {
  fileName: string;
  width: number;
  height: number;
  blob: Blob;
  dataUrl: string;
  purpose: string;
}

export interface FaviconOptions {
  shape: "square" | "rounded" | "circle";
  paddingPercent: number; // 0 to 40
  backgroundColor: string; // "transparent" or hex like "#ffffff"
  appName: string;
  themeColor: string;
}

/**
 * Creates an ICO binary Blob containing PNG frames (standard modern format).
 */
export async function createIcoBlob(
  pngFrames: { width: number; height: number; blob: Blob }[]
): Promise<Blob> {
  const buffers: Uint8Array[] = [];
  for (const frame of pngFrames) {
    const arrayBuffer = await frame.blob.arrayBuffer();
    buffers.push(new Uint8Array(arrayBuffer));
  }

  const numImages = pngFrames.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalHeaderSize = headerSize + numImages * dirEntrySize;

  let totalFileSize = totalHeaderSize;
  for (const buf of buffers) {
    totalFileSize += buf.length;
  }

  const out = new Uint8Array(totalFileSize);
  const view = new DataView(out.buffer);

  // 1. ICONDIR (6 bytes)
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // Type (1 = ICO)
  view.setUint16(4, numImages, true); // Count

  // 2. ICONDIRENTRY array (16 bytes each)
  let currentOffset = totalHeaderSize;
  for (let i = 0; i < numImages; i++) {
    const frame = pngFrames[i];
    const buf = buffers[i];
    const entryOffset = headerSize + i * dirEntrySize;

    // Width & Height (0 means 256px in ICO spec)
    const w = frame.width >= 256 ? 0 : frame.width;
    const h = frame.height >= 256 ? 0 : frame.height;

    view.setUint8(entryOffset + 0, w);
    view.setUint8(entryOffset + 1, h);
    view.setUint8(entryOffset + 2, 0); // Color count (0 = 256+ colors)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32-bit RGBA)
    view.setUint32(entryOffset + 8, buf.length, true); // Image data size in bytes
    view.setUint32(entryOffset + 12, currentOffset, true); // Offset of image data

    // Copy PNG bytes into payload section
    out.set(buf, currentOffset);
    currentOffset += buf.length;
  }

  return new Blob([out], { type: "image/x-icon" });
}

/**
 * Render a single favicon icon size on canvas with shape, padding, and background
 */
export async function renderFaviconCanvas(
  img: HTMLImageElement,
  size: number,
  options: FaviconOptions
): Promise<HTMLCanvasElement> {
  const { canvas, ctx } = createCanvas(size, size);

  // 1. Draw shape / clipping path
  ctx.save();
  if (options.shape === "circle") {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  } else if (options.shape === "rounded") {
    const radius = Math.round(size * 0.22); // standard squircle/rounded ratio
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();
  }

  // 2. Background color fill
  if (options.backgroundColor && options.backgroundColor !== "transparent") {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, size, size);
  }

  // 3. Draw image with padding
  const paddingPx = Math.round(size * (options.paddingPercent / 100));
  const innerSize = Math.max(1, size - paddingPx * 2);

  // Maintain aspect ratio centered in inner box
  const aspect = img.naturalWidth / img.naturalHeight;
  let drawW = innerSize;
  let drawH = innerSize;

  if (aspect > 1) {
    drawH = innerSize / aspect;
  } else {
    drawW = innerSize * aspect;
  }

  const drawX = paddingPx + (innerSize - drawW) / 2;
  const drawY = paddingPx + (innerSize - drawH) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  return canvas;
}

/**
 * Generate full favicon suite from source image
 */
export async function generateFaviconSuite(
  imgUrl: string,
  options: FaviconOptions
): Promise<{
  variants: FaviconVariant[];
  icoBlob: Blob;
  manifestJson: string;
  htmlSnippet: string;
}> {
  const img = await loadImage(imgUrl);

  const SIZES = [
    { name: "favicon-16x16.png", size: 16, purpose: "Standard browser tab icon" },
    { name: "favicon-32x32.png", size: 32, purpose: "Retina browser tab icon" },
    { name: "favicon-48x48.png", size: 48, purpose: "Desktop shortcut icon" },
    { name: "apple-touch-icon.png", size: 180, purpose: "Apple iOS home screen icon" },
    { name: "android-chrome-192x192.png", size: 192, purpose: "Android PWA standard icon" },
    { name: "android-chrome-512x512.png", size: 512, purpose: "Android PWA splash icon" },
  ];

  const variants: FaviconVariant[] = [];

  for (const s of SIZES) {
    const canvas = await renderFaviconCanvas(img, s.size, options);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), "image/png");
    });
    const dataUrl = canvas.toDataURL("image/png");

    variants.push({
      fileName: s.name,
      width: s.size,
      height: s.size,
      blob,
      dataUrl,
      purpose: s.purpose,
    });
  }

  // Create multi-resolution ICO from 16, 32, and 48px variants
  const icoFrames = variants
    .filter((v) => [16, 32, 48].includes(v.width))
    .map((v) => ({ width: v.width, height: v.height, blob: v.blob }));

  const icoBlob = await createIcoBlob(icoFrames);

  // Generate Webmanifest JSON
  const manifest = {
    name: options.appName || "My Web Application",
    short_name: options.appName || "App",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: options.themeColor || "#ffffff",
    background_color: options.themeColor || "#ffffff",
    display: "standalone",
  };
  const manifestJson = JSON.stringify(manifest, null, 2);

  // Generate HTML snippet
  const htmlSnippet = `<!-- Favicon & App Icons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${options.themeColor || "#ffffff"}">`;

  return {
    variants,
    icoBlob,
    manifestJson,
    htmlSnippet,
  };
}
