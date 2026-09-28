/**
 * Utilities for the SVG Viewer & Live Editor Studio
 */

export interface SvgStats {
  isValid: boolean;
  error?: string;
  width: number;
  height: number;
  viewBox: string;
  pathCount: number;
  circleCount: number;
  rectCount: number;
  elementCount: number;
  byteSize: number;
  colors: string[];
}

/**
 * Prettifies/formats SVG XML with proper indentation
 */
export function formatSvgXml(xml: string): string {
  if (!xml || typeof xml !== "string") return "";

  try {
    let formatted = "";
    let indent = 0;
    // Normalize newlines and spacing around tags
    const cleanXml = xml
      .replace(/>\s*</g, "><")
      .replace(/<!--[\s\S]*?-->/g, (c) => c.trim())
      .replace(/(>)(<)(\/*)/g, "$1\r\n$2$3");

    const lines = cleanXml.split("\r\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Closing tag: decrease indent before writing
      if (line.match(/^<\/[a-zA-Z0-9_:-]+>/)) {
        indent = Math.max(0, indent - 1);
      }

      formatted += "  ".repeat(indent) + line + "\n";

      // Opening tag (that is not self-closing and doesn't contain its own close tag on same line)
      if (
        line.match(/^<[a-zA-Z0-9_:-]+[^>]*[^\/]>/) &&
        !line.match(/<\/[a-zA-Z0-9_:-]+>$/) &&
        !line.startsWith("<?") &&
        !line.startsWith("<!")
      ) {
        indent++;
      }
    }

    return formatted.trim();
  } catch {
    return xml;
  }
}

/**
 * Minifies SVG code by removing comments, redundant spaces, and line breaks
 */
export function minifySvg(xml: string): string {
  if (!xml) return "";
  return xml
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Parses SVG metadata, dimensions, and color palette
/**
 * Detects unique hex and rgb colors in an SVG string
 */
export function extractSvgColors(svgString: string): string[] {
  const colorSet = new Set<string>();
  const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  const rgbRegex = /rgba?\([^)]+\)/g;

  const matchesHex = svgString.match(hexRegex) || [];
  for (const hex of matchesHex) {
    colorSet.add(hex.toUpperCase());
  }

  const matchesRgb = svgString.match(rgbRegex) || [];
  for (const rgb of matchesRgb) {
    colorSet.add(rgb);
  }

  return Array.from(colorSet).slice(0, 16);
}

/**
 * Calculates byte size in UTF-8 deterministically across Node.js SSR and browser CSR
 */
export function getSvgByteSize(svgString: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(svgString).length;
  }
  return svgString.length;
}

/**
 * Parses SVG metadata, dimensions, and color palette.
 * Produces deterministic, identical output on both server (SSR) and client (hydration).
 */
export function parseSvgStats(svgString: string): SvgStats {
  if (!svgString || !svgString.trim()) {
    return {
      isValid: false,
      error: "SVG code is empty",
      width: 0,
      height: 0,
      viewBox: "",
      pathCount: 0,
      circleCount: 0,
      rectCount: 0,
      elementCount: 0,
      byteSize: 0,
      colors: [],
    };
  }

  const byteSize = getSvgByteSize(svgString);

  // Validate root <svg> element
  const hasSvgTag = /<svg\b[^>]*>/i.test(svgString);
  if (!hasSvgTag) {
    return {
      isValid: false,
      error: "Missing root <svg> element",
      width: 0,
      height: 0,
      viewBox: "",
      pathCount: 0,
      circleCount: 0,
      rectCount: 0,
      elementCount: 0,
      byteSize,
      colors: [],
    };
  }

  // Check browser-side DOMParser if running in browser to catch syntax errors
  if (typeof window !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        return {
          isValid: false,
          error: parserError.textContent || "XML parsing syntax error",
          width: 0,
          height: 0,
          viewBox: "",
          pathCount: 0,
          circleCount: 0,
          rectCount: 0,
          elementCount: 0,
          byteSize,
          colors: [],
        };
      }
    } catch {
      // Ignore parser failure in edge environments
    }
  }

  // Dimensions & viewBox (consistent across Node and browser)
  const vbMatch = svgString.match(/\bviewBox=["']([^"']+)["']/i);
  const viewBox = vbMatch ? vbMatch[1].trim() : "";
  const wMatch = svgString.match(/<svg\b[^>]*\bwidth=["']([^"']+)["']/i);
  const hMatch = svgString.match(/<svg\b[^>]*\bheight=["']([^"']+)["']/i);

  let width = wMatch ? parseFloat(wMatch[1]) : NaN;
  let height = hMatch ? parseFloat(hMatch[1]) : NaN;

  if (viewBox && (isNaN(width) || isNaN(height) || width <= 0 || height <= 0)) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length >= 4) {
      if (isNaN(width) || width <= 0) width = parts[2];
      if (isNaN(height) || height <= 0) height = parts[3];
    }
  }

  if (isNaN(width) || width <= 0) width = 512;
  if (isNaN(height) || height <= 0) height = 512;

  // Counts (deterministic regex matching across SSR and CSR)
  const pathCount = (svgString.match(/<path\b/gi) || []).length;
  const circleCount = (svgString.match(/<circle\b|<ellipse\b/gi) || []).length;
  const rectCount = (svgString.match(/<rect\b/gi) || []).length;

  // Count all opening XML tags inside the SVG, excluding root <svg>
  const allOpeningTags = svgString.match(/<([a-zA-Z][a-zA-Z0-9_:-]*)\b/gi) || [];
  const svgTags = svgString.match(/<svg\b/gi) || [];
  const elementCount = Math.max(0, allOpeningTags.length - svgTags.length);

  // Extract color palette deterministically
  const colors = extractSvgColors(svgString);

  return {
    isValid: true,
    width: Math.round(width),
    height: Math.round(height),
    viewBox,
    pathCount,
    circleCount,
    rectCount,
    elementCount,
    byteSize,
    colors,
  };
}

/**
 * Replaces a color across all instances in an SVG string
 */
export function replaceColorInSvg(svgString: string, oldColor: string, newColor: string): string {
  if (!svgString || !oldColor || !newColor) return svgString;
  const escaped = oldColor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "gi");
  return svgString.replace(regex, newColor);
}

/**
 * Converts SVG to React JSX / TSX functional component code
 */
export function svgToJsx(svgString: string, componentName = "SvgIcon"): string {
  let jsx = svgString
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/class=/g, "className=")
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/stroke-linecap=/g, "strokeLinecap=")
    .replace(/stroke-linejoin=/g, "strokeLinejoin=")
    .replace(/stroke-miterlimit=/g, "strokeMiterlimit=")
    .replace(/stroke-dasharray=/g, "strokeDasharray=")
    .replace(/stroke-dashoffset=/g, "strokeDashoffset=")
    .replace(/stroke-opacity=/g, "strokeOpacity=")
    .replace(/fill-opacity=/g, "fillOpacity=")
    .replace(/fill-rule=/g, "fillRule=")
    .replace(/clip-rule=/g, "clipRule=")
    .replace(/clip-path=/g, "clipPath=")
    .replace(/stop-color=/g, "stopColor=")
    .replace(/stop-opacity=/g, "stopOpacity=")
    .replace(/xmlns:xlink=/g, "xmlnsXlink=")
    .replace(/xlink:href=/g, "xlinkHref=")
    .trim();

  return `import React from "react";

export function ${componentName}(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${jsx.replace(/^<svg/, "<svg {...props}")}
  );
}

export default ${componentName};`;
}

/**
 * Encodes SVG into Data URI
 */
export function svgToDataUri(svgString: string, base64 = false): string {
  if (base64) {
    const b64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${b64}`;
  }
  const encoded = encodeURIComponent(svgString)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * Curated Preset SVGs for instant testing
 */
export const SAMPLE_SVGS = [
  {
    name: "Docsy Mark",
    filename: "docforge-aperture.svg",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#7C3AED" />
    </linearGradient>
    <filter id="studioGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#4F46E5" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Ambient Backdrop -->
  <rect width="200" height="200" rx="44" fill="#090D16" />

  <!-- Lens Aperture Outer Ring -->
  <circle cx="100" cy="100" r="68" fill="none" stroke="url(#primaryGrad)" stroke-width="6" filter="url(#studioGlow)" />
  <circle cx="100" cy="100" r="54" fill="none" stroke="#262E40" stroke-width="2" stroke-dasharray="4 4" />

  <!-- Dynamic Aperture Blades -->
  <g stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M116 72 L156 142" stroke="#818CF8" />
    <path d="M84 72 L164 72" stroke="#C084FC" />
    <path d="M68 100 L108 170" stroke="#38BDF8" />
    <path d="M84 128 L44 58" stroke="#818CF8" />
    <path d="M116 128 L36 128" stroke="#C084FC" />
    <path d="M132 100 L92 30" stroke="#38BDF8" />
  </g>

  <!-- Center Shutter Core -->
  <circle cx="100" cy="100" r="16" fill="url(#primaryGrad)" />
  <circle cx="100" cy="100" r="6" fill="#FFFFFF" />
</svg>`,
  },
  {
    name: "Modern Tech Cloud",
    filename: "cloud-pulse.svg",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="36" fill="#0F172A" />
  <path d="M60 148 a34 34 0 0 1 2 -12 a44 44 0 0 1 84 -12 a38 38 0 0 1 42 38 a36 36 0 0 1 -36 36 h-82 a40 40 0 0 1 -10 -80 z" 
        fill="url(#cloudGrad)" opacity="0.9" />
  <circle cx="120" cy="148" r="8" fill="#FFFFFF" />
  <line x1="84" y1="148" x2="156" y2="148" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 6" />
</svg>`,
  },
  {
    name: "Isometric Cube Matrix",
    filename: "isometric-cube.svg",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="topFace" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="100%" stop-color="#FB7185"/>
    </linearGradient>
    <linearGradient id="leftFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#BE123C"/>
      <stop offset="100%" stop-color="#881337"/>
    </linearGradient>
    <linearGradient id="rightFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#9F1239"/>
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="40" fill="#18181B" />
  <!-- Top Face -->
  <polygon points="120,45 185,82 120,120 55,82" fill="url(#topFace)"/>
  <!-- Left Face -->
  <polygon points="55,82 120,120 120,195 55,157" fill="url(#leftFace)"/>
  <!-- Right Face -->
  <polygon points="120,120 185,82 185,157 120,195" fill="url(#rightFace)"/>
  <!-- Border accents -->
  <polyline points="55,82 120,120 185,82" fill="none" stroke="#FFE4E6" stroke-width="2" opacity="0.6"/>
  <line x1="120" y1="120" x2="120" y2="195" stroke="#FFE4E6" stroke-width="2" opacity="0.6"/>
</svg>`,
  },
  {
    name: "Cyber Security Shield",
    filename: "security-shield.svg",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="#064E3B" />
  <path d="M100 36 L154 60 C154 116 130 152 100 168 C70 152 46 116 46 60 Z" 
        fill="url(#shieldGrad)" stroke="#34D399" stroke-width="3" />
  <path d="M84 98 L96 110 L122 84" 
        fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
  },
];
