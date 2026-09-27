/**
 * Pure TypeScript EXIF and image metadata parser and sanitizer
 * Reads JPEG APP1 / TIFF IFD tags client-side without external dependencies.
 */
import { canvasToBlob, createCanvas } from "./canvasUtils";
import { loadImage } from "./fileUtils";

export interface ParsedExifData {
  hasExif: boolean;
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: number;
  focalLength?: string;
  lensModel?: string;
  flash?: string;
  whiteBalance?: string;
  orientation?: number;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    latitudeRef?: string;
    longitudeRef?: string;
    mapUrl?: string;
  };
  rawTags: Record<string, string | number>;
}

// Common EXIF Tag IDs
const TAGS: Record<number, string> = {
  0x010f: "Make",
  0x0110: "Model",
  0x0112: "Orientation",
  0x0131: "Software",
  0x0132: "DateTime",
  0x829a: "ExposureTime",
  0x829d: "FNumber",
  0x8827: "ISOSpeedRatings",
  0x9003: "DateTimeOriginal",
  0x9004: "DateTimeDigitized",
  0x920a: "FocalLength",
  0x9209: "Flash",
  0xa403: "WhiteBalance",
  0xa434: "LensModel",
  0x0002: "GPSLatitude",
  0x0004: "GPSLongitude",
  0x0006: "GPSAltitude",
};

export async function parseImageExif(file: File): Promise<ParsedExifData> {
  const result: ParsedExifData = {
    hasExif: false,
    rawTags: {},
  };

  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    // Check for JPEG SOI (0xFFD8)
    if (view.getUint16(0, false) !== 0xffd8) {
      return result;
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length) {
      if (offset + 1 >= length) break;
      const marker = view.getUint16(offset, false);
      offset += 2;

      // APP1 Marker (0xFFE1) contains EXIF
      if (marker === 0xffe1) {
        const app1Length = view.getUint16(offset, false);
        offset += 2;

        // Check for 'Exif\0\0' (0x457869660000)
        const exifHeader = view.getUint32(offset, false);
        if (exifHeader === 0x45786966 && view.getUint16(offset + 4, false) === 0x0000) {
          result.hasExif = true;
          const tiffStart = offset + 6;
          parseTiff(view, tiffStart, result);
        }
        break;
      } else if ((marker & 0xff00) === 0xff00) {
        // Other JPEG marker, skip its length
        if (offset + 2 > length) break;
        const segmentLength = view.getUint16(offset, false);
        offset += segmentLength;
      } else {
        break;
      }
    }
  } catch (err) {
    console.warn("Could not read EXIF data:", err);
  }

  return result;
}

function parseTiff(view: DataView, tiffStart: number, result: ParsedExifData) {
  const byteOrder = view.getUint16(tiffStart, false);
  const littleEndian = byteOrder === 0x4949; // 'II'

  // Validate 42 marker
  if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) return;

  const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
  if (firstIfdOffset < 8) return;

  parseIfd(view, tiffStart, tiffStart + firstIfdOffset, littleEndian, result);
}

function parseIfd(
  view: DataView,
  tiffStart: number,
  ifdStart: number,
  littleEndian: boolean,
  result: ParsedExifData
) {
  if (ifdStart + 2 > view.byteLength) return;
  const numEntries = view.getUint16(ifdStart, littleEndian);

  let offset = ifdStart + 2;

  for (let i = 0; i < numEntries; i++) {
    if (offset + 12 > view.byteLength) break;

    const tag = view.getUint16(offset, littleEndian);
    const type = view.getUint16(offset + 2, littleEndian);
    const count = view.getUint32(offset + 4, littleEndian);
    const valueOffset = offset + 8;

    // Check for pointer to Exif sub-IFD (0x8769) or GPS IFD (0x8825)
    if (tag === 0x8769) {
      const subIfdOffset = view.getUint32(valueOffset, littleEndian);
      parseIfd(view, tiffStart, tiffStart + subIfdOffset, littleEndian, result);
    } else if (tag === 0x8825) {
      const gpsIfdOffset = view.getUint32(valueOffset, littleEndian);
      parseGpsIfd(view, tiffStart, tiffStart + gpsIfdOffset, littleEndian, result);
    } else {
      const tagName = TAGS[tag] || `Tag_0x${tag.toString(16)}`;
      const val = readTagValue(view, tiffStart, type, count, valueOffset, littleEndian);

      if (val !== undefined) {
        result.rawTags[tagName] = val;

        if (tag === 0x010f) result.make = String(val).trim();
        if (tag === 0x0110) result.model = String(val).trim();
        if (tag === 0x0131) result.software = String(val).trim();
        if (tag === 0x0132) result.dateTime = String(val).trim();
        if (tag === 0x9003) result.dateTimeOriginal = String(val).trim();
        if (tag === 0x8827) result.iso = Number(val);
        if (tag === 0xa434) result.lensModel = String(val).trim();
        if (tag === 0x0112) result.orientation = Number(val);

        if (tag === 0x829a) {
          // Exposure time rational
          const num = Number(val);
          result.exposureTime = num < 1 && num > 0 ? `1/${Math.round(1 / num)}s` : `${num}s`;
        }
        if (tag === 0x829d) {
          // F-number
          result.fNumber = `f/${parseFloat(Number(val).toFixed(1))}`;
        }
        if (tag === 0x920a) {
          // Focal length
          result.focalLength = `${parseFloat(Number(val).toFixed(1))} mm`;
        }
        if (tag === 0x9209) {
          const f = Number(val);
          result.flash = (f & 1) ? "Fired" : "Did not fire";
        }
        if (tag === 0xa403) {
          result.whiteBalance = Number(val) === 1 ? "Manual" : "Auto";
        }
      }
    }

    offset += 12;
  }
}

function parseGpsIfd(
  view: DataView,
  tiffStart: number,
  gpsStart: number,
  littleEndian: boolean,
  result: ParsedExifData
) {
  if (gpsStart + 2 > view.byteLength) return;
  const numEntries = view.getUint16(gpsStart, littleEndian);
  let offset = gpsStart + 2;

  let latDeg: number[] | null = null;
  let lonDeg: number[] | null = null;
  let latRef = "N";
  let lonRef = "E";
  let alt: number | null = null;

  for (let i = 0; i < numEntries; i++) {
    if (offset + 12 > view.byteLength) break;
    const tag = view.getUint16(offset, littleEndian);
    const type = view.getUint16(offset + 2, littleEndian);
    const count = view.getUint32(offset + 4, littleEndian);
    const valueOffset = offset + 8;

    if (tag === 0x0001) {
      // GPSLatitudeRef
      latRef = String.fromCharCode(view.getUint8(valueOffset));
    } else if (tag === 0x0002 && count === 3) {
      // GPSLatitude (3 rationals)
      const dataOffset = view.getUint32(valueOffset, littleEndian);
      latDeg = [
        readRational(view, tiffStart + dataOffset, littleEndian),
        readRational(view, tiffStart + dataOffset + 8, littleEndian),
        readRational(view, tiffStart + dataOffset + 16, littleEndian),
      ];
    } else if (tag === 0x0003) {
      // GPSLongitudeRef
      lonRef = String.fromCharCode(view.getUint8(valueOffset));
    } else if (tag === 0x0004 && count === 3) {
      // GPSLongitude
      const dataOffset = view.getUint32(valueOffset, littleEndian);
      lonDeg = [
        readRational(view, tiffStart + dataOffset, littleEndian),
        readRational(view, tiffStart + dataOffset + 8, littleEndian),
        readRational(view, tiffStart + dataOffset + 16, littleEndian),
      ];
    } else if (tag === 0x0006) {
      // Altitude
      const dataOffset = view.getUint32(valueOffset, littleEndian);
      alt = readRational(view, tiffStart + dataOffset, littleEndian);
    }

    offset += 12;
  }

  if (latDeg && lonDeg) {
    let lat = latDeg[0] + latDeg[1] / 60 + latDeg[2] / 3600;
    let lon = lonDeg[0] + lonDeg[1] / 60 + lonDeg[2] / 3600;
    if (latRef === "S") lat = -lat;
    if (lonRef === "W") lon = -lon;

    result.gps = {
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lon.toFixed(6)),
      altitude: alt ? parseFloat(alt.toFixed(1)) : undefined,
      latitudeRef: latRef,
      longitudeRef: lonRef,
      mapUrl: `https://www.google.com/maps?q=${lat},${lon}`,
    };
  }
}

function readTagValue(
  view: DataView,
  tiffStart: number,
  type: number,
  count: number,
  valueOffset: number,
  littleEndian: boolean
): string | number | undefined {
  if (type === 2) {
    // ASCII string
    const stringOffset = count > 4 ? tiffStart + view.getUint32(valueOffset, littleEndian) : valueOffset;
    let str = "";
    for (let j = 0; j < count - 1; j++) {
      if (stringOffset + j >= view.byteLength) break;
      const charCode = view.getUint8(stringOffset + j);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
    }
    return str;
  } else if (type === 3) {
    // SHORT (16-bit)
    return view.getUint16(valueOffset, littleEndian);
  } else if (type === 4) {
    // LONG (32-bit)
    return view.getUint32(valueOffset, littleEndian);
  } else if (type === 5) {
    // RATIONAL (two 32-bit unsigned ints)
    const dataOffset = tiffStart + view.getUint32(valueOffset, littleEndian);
    return readRational(view, dataOffset, littleEndian);
  }
  return undefined;
}

function readRational(view: DataView, offset: number, littleEndian: boolean): number {
  if (offset + 8 > view.byteLength) return 0;
  const num = view.getUint32(offset, littleEndian);
  const den = view.getUint32(offset + 4, littleEndian);
  return den === 0 ? 0 : num / den;
}

/**
 * Strips all metadata by loading image into a clean HTML5 canvas and re-encoding.
 * This completely removes EXIF, GPS, camera serials, and thumbnail data.
 */
export async function stripImageMetadata(
  file: File,
  outputFormat: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
  quality = 0.95
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const { canvas, ctx } = createCanvas(img.naturalWidth, img.naturalHeight);
    ctx.drawImage(img, 0, 0);
    return await canvasToBlob(canvas, outputFormat, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
