/**
 * Canvas-based image manipulation utilities running purely client-side
 */

export type SupportedOutputFormat = "image/png" | "image/jpeg" | "image/webp" | "image/bmp";

export interface ResizeOptions {
  width: number;
  height: number;
  format?: SupportedOutputFormat;
  quality?: number;
  fit?: "contain" | "cover" | "fill";
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WatermarkOptions {
  type: "text" | "image";
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  watermarkImage?: HTMLImageElement;
  opacity: number; // 0 to 1
  rotation: number; // degrees
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "middle-left"
    | "center"
    | "middle-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
    | "tiled";
  scale?: number; // for image watermark
}

/**
 * Creates an in-memory canvas
 */
export function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not obtain 2D canvas context");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

/**
 * Converts a canvas to a Blob with fallback
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = "image/png",
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback for formats not directly supported by canvas.toBlob (e.g. BMP)
            try {
              const dataUrl = canvas.toDataURL(format, quality);
              const blob = dataUrlToBlob(dataUrl);
              resolve(blob);
            } catch (err) {
              reject(new Error(`Failed to convert canvas to ${format}: ${err}`));
            }
          }
        },
        format,
        quality
      );
    } catch (err) {
      reject(err);
    }
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

/**
 * Resizes an image to specified width and height
 */
export function resizeImage(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  backgroundColor?: string
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(targetWidth, targetHeight);

  if (backgroundColor && backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return canvas;
}

/**
 * Crops an image to a bounding box
 */
export function cropImage(
  img: HTMLImageElement,
  crop: CropRect,
  backgroundColor?: string
): HTMLCanvasElement {
  const safeW = Math.max(1, Math.round(crop.width));
  const safeH = Math.max(1, Math.round(crop.height));
  const { canvas, ctx } = createCanvas(safeW, safeH);

  if (backgroundColor && backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, safeW, safeH);
  }

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    safeW,
    safeH
  );
  return canvas;
}

/**
 * Rotates and flips an image
 */
export function rotateAndFlipImage(
  img: HTMLImageElement,
  angleDeg: number,
  flipH: boolean,
  flipV: boolean
): HTMLCanvasElement {
  const radians = (angleDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  // Calculate new bounding box dimensions
  const newWidth = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
  const newHeight = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

  const { canvas, ctx } = createCanvas(newWidth, newHeight);

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(
    img,
    -img.naturalWidth / 2,
    -img.naturalHeight / 2,
    img.naturalWidth,
    img.naturalHeight
  );

  return canvas;
}

/**
 * Applies text or logo watermark onto an image
 */
export function applyWatermark(
  img: HTMLImageElement,
  options: WatermarkOptions
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);

  const w = canvas.width;
  const h = canvas.height;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, options.opacity));

  if (options.type === "text" && options.text) {
    const text = options.text;
    const fontSize = options.fontSize || Math.max(16, Math.round(w / 25));
    const font = `${fontSize}px ${options.fontFamily || "sans-serif"}`;
    ctx.font = font;
    ctx.fillStyle = options.textColor || "#ffffff";
    ctx.textBaseline = "middle";

    if (options.position === "tiled") {
      ctx.textAlign = "center";
      const metrics = ctx.measureText(text);
      const stepX = metrics.width + 120;
      const stepY = fontSize * 3.5;
      const rad = (options.rotation * Math.PI) / 180;

      for (let x = -w; x < w * 2; x += stepX) {
        for (let y = -h; y < h * 2; y += stepY) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rad);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
    } else {
      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const textH = fontSize;
      const padding = Math.max(20, Math.round(w * 0.03));

      let x = padding;
      let y = padding + textH / 2;

      switch (options.position) {
        case "top-left":
          x = padding;
          y = padding + textH / 2;
          ctx.textAlign = "left";
          break;
        case "top-center":
          x = w / 2;
          y = padding + textH / 2;
          ctx.textAlign = "center";
          break;
        case "top-right":
          x = w - padding;
          y = padding + textH / 2;
          ctx.textAlign = "right";
          break;
        case "middle-left":
          x = padding;
          y = h / 2;
          ctx.textAlign = "left";
          break;
        case "center":
          x = w / 2;
          y = h / 2;
          ctx.textAlign = "center";
          break;
        case "middle-right":
          x = w - padding;
          y = h / 2;
          ctx.textAlign = "right";
          break;
        case "bottom-left":
          x = padding;
          y = h - padding - textH / 2;
          ctx.textAlign = "left";
          break;
        case "bottom-center":
          x = w / 2;
          y = h - padding - textH / 2;
          ctx.textAlign = "center";
          break;
        case "bottom-right":
          x = w - padding;
          y = h - padding - textH / 2;
          ctx.textAlign = "right";
          break;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  } else if (options.type === "image" && options.watermarkImage) {
    const wmImg = options.watermarkImage;
    const scale = options.scale || 0.25;
    const wmWidth = (w * scale);
    const wmHeight = (wmImg.naturalHeight / wmImg.naturalWidth) * wmWidth;
    const padding = Math.max(20, Math.round(w * 0.03));

    let x = padding;
    let y = padding;

    switch (options.position) {
      case "top-left":
        x = padding;
        y = padding;
        break;
      case "top-center":
        x = (w - wmWidth) / 2;
        y = padding;
        break;
      case "top-right":
        x = w - wmWidth - padding;
        y = padding;
        break;
      case "middle-left":
        x = padding;
        y = (h - wmHeight) / 2;
        break;
      case "center":
        x = (w - wmWidth) / 2;
        y = (h - wmHeight) / 2;
        break;
      case "middle-right":
        x = w - wmWidth - padding;
        y = (h - wmHeight) / 2;
        break;
      case "bottom-left":
        x = padding;
        y = h - wmHeight - padding;
        break;
      case "bottom-center":
        x = (w - wmWidth) / 2;
        y = h - wmHeight - padding;
        break;
      case "bottom-right":
        x = w - wmWidth - padding;
        y = h - wmHeight - padding;
        break;
      case "tiled":
        for (let tx = 0; tx < w; tx += wmWidth + 80) {
          for (let ty = 0; ty < h; ty += wmHeight + 80) {
            ctx.drawImage(wmImg, tx, ty, wmWidth, wmHeight);
          }
        }
        ctx.restore();
        return canvas;
    }

    ctx.save();
    ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.drawImage(wmImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
    ctx.restore();
  }

  ctx.restore();
  return canvas;
}

/**
 * Removes or replaces a background color using color keying / tolerance
 */
export function replaceBackgroundColor(
  img: HTMLImageElement,
  targetHex: string,
  tolerancePercent: number, // 0 to 100
  replacementHex?: string // If undefined, makes transparent
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Parse target color
  const targetR = parseInt(targetHex.slice(1, 3), 16) || 255;
  const targetG = parseInt(targetHex.slice(3, 5), 16) || 255;
  const targetB = parseInt(targetHex.slice(5, 7), 16) || 255;

  const replaceR = replacementHex ? parseInt(replacementHex.slice(1, 3), 16) || 0 : 0;
  const replaceG = replacementHex ? parseInt(replacementHex.slice(3, 5), 16) || 0 : 0;
  const replaceB = replacementHex ? parseInt(replacementHex.slice(5, 7), 16) || 0 : 0;

  // Euclidean color distance maximum is sqrt(255^2 * 3) ~= 441.67
  const maxDist = (tolerancePercent / 100) * 441.67;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const dist = Math.sqrt(
      Math.pow(r - targetR, 2) +
      Math.pow(g - targetG, 2) +
      Math.pow(b - targetB, 2)
    );

    if (dist <= maxDist) {
      if (!replacementHex || replacementHex === "transparent") {
        // Feather near edges
        if (dist > maxDist * 0.8) {
          const factor = (dist - maxDist * 0.8) / (maxDist * 0.2);
          data[i + 3] = Math.round(a * factor);
        } else {
          data[i + 3] = 0;
        }
      } else {
        data[i] = replaceR;
        data[i + 1] = replaceG;
        data[i + 2] = replaceB;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Checks if an image has any transparent or semi-transparent pixels
 */
export function detectTransparency(img: HTMLImageElement): boolean {
  const { canvas, ctx } = createCanvas(Math.min(img.naturalWidth, 200), Math.min(img.naturalHeight, 200));
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

/**
 * Extracts dominant colors from an image
 */
export function extractDominantColors(
  img: HTMLImageElement,
  maxColors = 6
): { hex: string; rgb: string; count: number }[] {
  const sampleW = Math.min(img.naturalWidth, 120);
  const sampleH = Math.min(img.naturalHeight, 120);
  const { canvas, ctx } = createCanvas(sampleW, sampleH);
  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const data = ctx.getImageData(0, 0, sampleW, sampleH).data;

  // Simple color quantization bucket
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();
  const bucketSize = 24;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue; // ignore transparent

    const r = Math.round(data[i] / bucketSize) * bucketSize;
    const g = Math.round(data[i + 1] / bucketSize) * bucketSize;
    const b = Math.round(data[i + 2] / bucketSize) * bucketSize;

    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { r, g, b, count: 1 });
    }
  }

  const sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);

  return sorted.slice(0, maxColors).map((c) => {
    const toHex = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0");
    const hex = `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
    return {
      hex,
      rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
      count: c.count,
    };
  });
}
