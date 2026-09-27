"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { formatBytes, loadImage } from "@/lib/fileUtils";
import { detectTransparency, extractDominantColors } from "@/lib/canvasUtils";

interface DetailedImageInfo {
  name: string;
  sizeBytes: number;
  mimeType: string;
  lastModified: string;
  width: number;
  height: number;
  aspectRatioRatio: string;
  aspectRatioLabel: string;
  megapixels: string;
  hasAlpha: boolean;
  colors: { hex: string; rgb: string; count: number }[];
}

export default function ImageInfoClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [info, setInfo] = useState<DetailedImageInfo | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f || !f.type.startsWith("image/")) {
      setToastMsg("Please select a valid image.");
      return;
    }

    const url = URL.createObjectURL(f);
    setFile(f);
    setImgUrl(url);

    try {
      const img = await loadImage(url);

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const div = gcd(img.naturalWidth, img.naturalHeight);
      const ratioStr = `${img.naturalWidth / div}:${img.naturalHeight / div}`;

      const numRatio = img.naturalWidth / img.naturalHeight;
      let label = "Custom";
      if (Math.abs(numRatio - 1) < 0.05) label = "1:1 Square";
      else if (Math.abs(numRatio - 16 / 9) < 0.05) label = "16:9 Widescreen";
      else if (Math.abs(numRatio - 4 / 3) < 0.05) label = "4:3 Standard Photo";
      else if (Math.abs(numRatio - 9 / 16) < 0.05) label = "9:16 Mobile Story";
      else if (Math.abs(numRatio - 3 / 2) < 0.05) label = "3:2 DSLR / 35mm";

      const mp = ((img.naturalWidth * img.naturalHeight) / 1000000).toFixed(2);
      const hasAlpha = detectTransparency(img);
      const dominant = extractDominantColors(img, 6);

      setInfo({
        name: f.name,
        sizeBytes: f.size,
        mimeType: f.type || "image/unknown",
        lastModified: new Date(f.lastModified).toLocaleString(),
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatioRatio: ratioStr,
        aspectRatioLabel: label,
        megapixels: mp,
        hasAlpha,
        colors: dominant,
      });

      setToastMsg(`Analyzed ${f.name}`);
    } catch {
      setToastMsg("Could not analyze image.");
    }
  }

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex);
    setToastMsg(`Copied ${hex} to clipboard!`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="13 · Diagnostics"
            title="Image Info & Palette"
            description="Inspect pixel dimensions, aspect ratio classification, megapixels, transparency channel, and extract dominant color palette with 1-click hex copy."
            badge="Studio Inspector"
          />

          {!file ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/*"
                multiple={false}
                onFiles={handleFile}
                label="Drop an image to inspect diagnostics, or click to browse"
                hint="PNG · JPG · WebP · AVIF · SVG · GIF · Instant client-side analysis"
              />
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              {/* Header Overview Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                  />
                  <div>
                    <h2 className="font-semibold text-text text-[15px] truncate max-w-[150px] xs:max-w-xs sm:max-w-md">
                      {info?.name}
                    </h2>
                    <p className="font-mono text-[11px] text-muted">
                      {info?.width} × {info?.height} px · {formatBytes(info?.sizeBytes || 0)} · {info?.megapixels} MP
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setImgUrl("");
                    setInfo(null);
                  }}
                  className="h-9 px-3 rounded-lg border border-border bg-bg text-muted hover:text-text hover:border-border-hover text-[12px] font-medium transition-colors"
                >
                  Change Image
                </button>
              </div>

              {/* Dominant Color Palette Section */}
              {info && info.colors.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"/>
                        <path d="M7.75 3.5a.75.75 0 0 1 .75.75v3.25h3.25a.75.75 0 0 1 0 1.5H8.5V12.25a.75.75 0 0 1-1.5 0V9H3.75a.75.75 0 0 1 0-1.5H7V4.25a.75.75 0 0 1 .75-.75Z"/>
                      </svg>
                      <h3 className="text-[13px] font-semibold text-text">Dominant Palette</h3>
                    </div>
                    <span className="text-[11px] font-mono text-muted">Click any swatch to copy HEX</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {info.colors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => copyHex(c.hex)}
                        className="group flex flex-col rounded-lg border border-border bg-bg/50 p-2 text-left hover:border-accent hover:bg-surface transition-all cursor-pointer"
                      >
                        <div
                          className="h-12 w-full rounded-md shadow-inner transition-transform group-hover:scale-[1.02]"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="mt-2 space-y-0.5">
                          <span className="block font-mono text-[11px] font-semibold text-text group-hover:text-accent">
                            {c.hex.toUpperCase()}
                          </span>
                          <span className="block font-mono text-[9px] text-muted truncate">
                            {c.rgb}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dimensions & Resolution */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1.75 3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75ZM0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5Z"/>
                    </svg>
                    <h3 className="text-[13px] font-semibold text-text">Resolution & Framing</h3>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[12px]">
                    <div>
                      <dt className="text-muted text-[11px]">Pixel Width</dt>
                      <dd className="text-text mt-0.5 font-semibold">{info?.width} px</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Pixel Height</dt>
                      <dd className="text-text mt-0.5 font-semibold">{info?.height} px</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Megapixels</dt>
                      <dd className="text-accent mt-0.5 font-semibold">{info?.megapixels} MP</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Total Pixels</dt>
                      <dd className="text-text mt-0.5">
                        {((info?.width || 0) * (info?.height || 0)).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Aspect Ratio</dt>
                      <dd className="text-text mt-0.5 font-semibold">{info?.aspectRatioRatio}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Category</dt>
                      <dd className="text-accent mt-0.5 truncate">{info?.aspectRatioLabel}</dd>
                    </div>
                  </dl>
                </div>

                {/* File Encoding & Channels */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1.75 2.5h10.5a.25.25 0 0 1 .25.25v10.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75a.25.25 0 0 1 .25-.25ZM0 2.75C0 1.784.784 1 1.75 1h10.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 12.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75Z"/>
                    </svg>
                    <h3 className="text-[13px] font-semibold text-text">Encoding & Channels</h3>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[12px]">
                    <div>
                      <dt className="text-muted text-[11px]">File Format</dt>
                      <dd className="text-text mt-0.5">{info?.mimeType}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">File Size</dt>
                      <dd className="text-text mt-0.5 font-semibold">{formatBytes(info?.sizeBytes || 0)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Alpha Transparency</dt>
                      <dd className="mt-0.5">
                        {info?.hasAlpha ? (
                          <span className="text-emerald-500 font-semibold">Detected (Transparent)</span>
                        ) : (
                          <span className="text-muted">None (Opaque)</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Bytes Per Pixel</dt>
                      <dd className="text-text mt-0.5">
                        {info?.width && info?.height
                          ? (info.sizeBytes / (info.width * info.height)).toFixed(2) + " B/px"
                          : "—"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted text-[11px]">Last Modified</dt>
                      <dd className="text-text mt-0.5">{info?.lastModified}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Action Jump Bar */}
              <div className="rounded-xl border border-border bg-surface p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-[12px] font-mono text-muted">Direct workflow actions:</span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/tools/image-compressor"
                    className="h-8 px-3 rounded-lg border border-border bg-bg text-text hover:border-accent hover:text-accent text-[11px] font-mono transition-colors flex items-center gap-1.5"
                  >
                    <span>Compress Size ↗</span>
                  </Link>
                  <Link
                    href="/tools/image-resizer"
                    className="h-8 px-3 rounded-lg border border-border bg-bg text-text hover:border-accent hover:text-accent text-[11px] font-mono transition-colors flex items-center gap-1.5"
                  >
                    <span>Resize ↗</span>
                  </Link>
                  <Link
                    href="/tools/image-cropper"
                    className="h-8 px-3 rounded-lg border border-border bg-bg text-text hover:border-accent hover:text-accent text-[11px] font-mono transition-colors flex items-center gap-1.5"
                  >
                    <span>Crop ↗</span>
                  </Link>
                  <Link
                    href="/tools/base64"
                    className="h-8 px-3 rounded-lg border border-border bg-bg text-text hover:border-accent hover:text-accent text-[11px] font-mono transition-colors flex items-center gap-1.5"
                  >
                    <span>Base64 ↗</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
