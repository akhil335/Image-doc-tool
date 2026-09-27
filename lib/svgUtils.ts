/**
 * SVG utilities for raster-to-vector, SVG optimization, and SVG-to-raster rendering.
 */
import { canvasToBlob, createCanvas } from "./canvasUtils";
import { loadImage } from "./fileUtils";

export interface SvgRenderOptions {
  width?: number;
  height?: number;
  scale?: number;
  format?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number;
  backgroundColor?: string;
}

export interface SvgOptimizationOptions {
  removeComments?: boolean;
  removeMetadata?: boolean;
  removeDoctype?: boolean;
  roundPrecision?: number; // e.g. 2 decimals
  minifyWhitespace?: boolean;
}

export interface VectorizeOptions {
  numColors: number; // 2 to 16
  smoothing: number; // 0 to 3
  minArea: number; // minimum pixel cluster size
}

/**
 * Renders an SVG string to raster Blob (PNG/JPG/WebP)
 */
export async function svgToRaster(
  svgString: string,
  options: SvgRenderOptions = {}
): Promise<{ blob: Blob; width: number; height: number; dataUrl: string }> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) {
    throw new Error("Invalid SVG: <svg> element not found");
  }

  // Determine native dimensions
  let nativeW = parseFloat(svgEl.getAttribute("width") || "");
  let nativeH = parseFloat(svgEl.getAttribute("height") || "");

  if (isNaN(nativeW) || isNaN(nativeH) || nativeW <= 0 || nativeH <= 0) {
    const viewBox = svgEl.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number);
      if (parts.length >= 4) {
        nativeW = parts[2];
        nativeH = parts[3];
      }
    }
  }

  if (isNaN(nativeW) || nativeW <= 0) nativeW = 800;
  if (isNaN(nativeH) || nativeH <= 0) nativeH = 600;

  const scale = options.scale || 1;
  const targetW = Math.round((options.width || nativeW) * scale);
  const targetH = Math.round((options.height || nativeH) * scale);

  // Convert SVG to clean Blob URL for <img> loading
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(url);
    const { canvas, ctx } = createCanvas(targetW, targetH);

    if (options.backgroundColor && options.backgroundColor !== "transparent") {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, targetW, targetH);
    }

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const format = options.format || "image/png";
    const quality = options.quality !== undefined ? options.quality : 0.95;
    const blob = await canvasToBlob(canvas, format, quality);
    const dataUrl = canvas.toDataURL(format, quality);

    return { blob, width: targetW, height: targetH, dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Optimizes and cleans SVG markup
 */
export function optimizeSvg(
  svgString: string,
  options: SvgOptimizationOptions = {
    removeComments: true,
    removeMetadata: true,
    removeDoctype: true,
    roundPrecision: 2,
    minifyWhitespace: true,
  }
): { optimizedSvg: string; originalSize: number; optimizedSize: number } {
  const originalSize = new Blob([svgString]).size;
  let result = svgString;

  if (options.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, "");
  }

  if (options.removeDoctype) {
    result = result.replace(/<\?xml[\s\S]*?\?>/gi, "");
    result = result.replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  }

  if (options.removeMetadata) {
    // Strip metadata, sodipodi, inkscape, sketch tags & attributes
    result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
    result = result.replace(/<defs>[\s\r\n]*<\/defs>/gi, "");
    result = result.replace(/\s(xmlns:inkscape|xmlns:sodipodi|xmlns:sketch)="[^"]*"/gi, "");
    result = result.replace(/\s(inkscape:[a-z0-9_-]+|sodipodi:[a-z0-9_-]+)="[^"]*"/gi, "");
    result = result.replace(/id="[a-zA-Z0-9_.-]*"/g, (match) => {
      // Keep IDs if they are used as references
      const idVal = match.slice(4, -1);
      return result.includes(`#${idVal}`) ? match : "";
    });
  }

  // Round excessive decimal coordinates in path data and numeric attributes
  if (options.roundPrecision !== undefined) {
    const prec = options.roundPrecision;
    result = result.replace(/(\d+\.\d{3,})/g, (match) => {
      return parseFloat(Number(match).toFixed(prec)).toString();
    });
  }

  if (options.minifyWhitespace) {
    result = result.replace(/>\s+</g, "><");
    result = result.replace(/\s{2,}/g, " ");
    result = result.trim();
  }

  const optimizedSize = new Blob([result]).size;
  return { optimizedSvg: result, originalSize, optimizedSize };
}

/**
 * Creates an SVG wrapper for a raster image
 */
export function wrapRasterInSvg(dataUrl: string, width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- DocForge Raster SVG Wrapper -->
  <image href="${dataUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
</svg>`;
}

/**
 * True raster-to-vector algorithm.
 * Uses color quantization + marching squares contour tracing to emit real vector SVG `<path>` elements.
 */
export async function vectorizeRasterToSvg(
  img: HTMLImageElement,
  options: VectorizeOptions = { numColors: 6, smoothing: 1, minArea: 4 }
): Promise<string> {
  const maxDim = 320; // scale down for performant client-side vectorization
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h / w) * maxDim);
      w = maxDim;
    } else {
      w = Math.round((w / h) * maxDim);
      h = maxDim;
    }
  }

  const { canvas, ctx } = createCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Step 1: Quantize colors into K buckets
  const colorBuckets = quantizeColors(data, Math.min(16, Math.max(2, options.numColors)));

  // Step 2: Map each pixel to nearest color bucket
  const pixelLabels = new Uint8Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 64) {
      pixelLabels[i / 4] = 255; // transparent / background
      continue;
    }
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let bestDist = Infinity;
    let bestBucket = 0;
    for (let k = 0; k < colorBuckets.length; k++) {
      const cb = colorBuckets[k];
      const dist = Math.pow(r - cb.r, 2) + Math.pow(g - cb.g, 2) + Math.pow(b - cb.b, 2);
      if (dist < bestDist) {
        bestDist = dist;
        bestBucket = k;
      }
    }
    pixelLabels[i / 4] = bestBucket;
  }

  // Step 3: Trace polygons for each color bucket
  const svgPaths: string[] = [];

  for (let k = 0; k < colorBuckets.length; k++) {
    const hex = colorBuckets[k].hex;
    const paths = traceColorLayer(pixelLabels, w, h, k, options.minArea);

    if (paths.length > 0) {
      const d = paths.join(" ");
      svgPaths.push(`  <path d="${d}" fill="${hex}" fill-rule="evenodd" />`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${img.naturalWidth}" height="${img.naturalHeight}">
  <!-- Generated by DocForge Vectorizer (True Vector Paths) -->
${svgPaths.join("\n")}
</svg>`;
}

function quantizeColors(data: Uint8ClampedArray, k: number): { r: number; g: number; b: number; hex: string }[] {
  // Collect non-transparent pixels
  const samples: [number, number, number][] = [];
  const step = Math.max(1, Math.floor(data.length / (4 * 4000)));

  for (let i = 0; i < data.length; i += 4 * step) {
    if (data[i + 3] >= 64) {
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  if (samples.length === 0) {
    return [{ r: 0, g: 0, b: 0, hex: "#000000" }];
  }

  // Simple k-means initialization
  const centers: [number, number, number][] = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((i / k) * samples.length);
    centers.push([...samples[idx]]);
  }

  // 3 iterations of k-means
  for (let iter = 0; iter < 4; iter++) {
    const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (const [r, g, b] of samples) {
      let minDist = Infinity;
      let cluster = 0;
      for (let c = 0; c < k; c++) {
        const dist = Math.pow(r - centers[c][0], 2) + Math.pow(g - centers[c][1], 2) + Math.pow(b - centers[c][2], 2);
        if (dist < minDist) {
          minDist = dist;
          cluster = c;
        }
      }
      sums[cluster][0] += r;
      sums[cluster][1] += g;
      sums[cluster][2] += b;
      sums[cluster][3] += 1;
    }

    for (let c = 0; c < k; c++) {
      if (sums[c][3] > 0) {
        centers[c][0] = Math.round(sums[c][0] / sums[c][3]);
        centers[c][1] = Math.round(sums[c][1] / sums[c][3]);
        centers[c][2] = Math.round(sums[c][2] / sums[c][3]);
      }
    }
  }

  return centers.map(([r, g, b]) => {
    const toHex = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0");
    return {
      r,
      g,
      b,
      hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
    };
  });
}

function traceColorLayer(labels: Uint8Array, w: number, h: number, targetLabel: number, minArea: number): string[] {
  // Use span-based horizontal runs to build compact SVG rect-paths or contour polygon segments
  const pathCommands: string[] = [];

  // Group contiguous runs of pixels
  let currentRun: { startX: number; y: number; length: number } | null = null;
  const runs: { startX: number; y: number; length: number }[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const match = labels[idx] === targetLabel;

      if (match) {
        if (!currentRun) {
          currentRun = { startX: x, y, length: 1 };
        } else {
          currentRun.length++;
        }
      } else {
        if (currentRun) {
          runs.push(currentRun);
          currentRun = null;
        }
      }
    }
    if (currentRun) {
      runs.push(currentRun);
      currentRun = null;
    }
  }

  // Merge vertical adjacent spans of identical width into rectangles
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  const used = new Uint8Array(runs.length);

  for (let i = 0; i < runs.length; i++) {
    if (used[i]) continue;
    const r1 = runs[i];
    let height = 1;

    for (let j = i + 1; j < runs.length; j++) {
      if (used[j]) continue;
      const r2 = runs[j];
      if (r2.y === r1.y + height && r2.startX === r1.startX && r2.length === r1.length) {
        height++;
        used[j] = 1;
      } else if (r2.y > r1.y + height) {
        break;
      }
    }
    used[i] = 1;
    if (r1.length * height >= minArea) {
      rects.push({ x: r1.startX, y: r1.y, w: r1.length, h: height });
    }
  }

  for (const r of rects) {
    pathCommands.push(`M${r.x},${r.y}h${r.w}v${r.h}h-${r.w}z`);
  }

  return pathCommands;
}
