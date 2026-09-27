"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { formatBytes, getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import { parseImageExif, stripImageMetadata, ParsedExifData } from "@/lib/exifUtils";
import { saveAs } from "file-saver";

interface FileMetaSummary {
  name: string;
  size: number;
  type: string;
  lastModified: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export default function MetadataClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileMeta, setFileMeta] = useState<FileMetaSummary | null>(null);
  const [exif, setExif] = useState<ParsedExifData | null>(null);
  const [isStripping, setIsStripping] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f) return;

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    try {
      const img = await loadImage(url);
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const div = gcd(img.naturalWidth, img.naturalHeight);
      const aspect = `${img.naturalWidth / div}:${img.naturalHeight / div}`;

      setFileMeta({
        name: f.name,
        size: f.size,
        type: f.type || "image/unknown",
        lastModified: new Date(f.lastModified).toLocaleString(),
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: aspect,
      });

      const parsedExif = await parseImageExif(f);
      setExif(parsedExif);
      setToastMsg(`Read metadata for ${f.name}`);
    } catch {
      setToastMsg("Could not parse image metadata.");
    }
  }

  async function handleStripMetadata() {
    if (!file) return;
    setIsStripping(true);
    try {
      const cleanBlob = await stripImageMetadata(
        file,
        file.type === "image/png" ? "image/png" : "image/jpeg",
        0.95
      );
      const baseName = getFileNameWithoutExtension(file.name);
      const ext = file.type === "image/png" ? "png" : "jpg";
      saveAs(cleanBlob, `${baseName}-sanitized.${ext}`);
      setToastMsg("Privacy preserved! Downloaded sanitized image without metadata.");
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to strip metadata.");
    } finally {
      setIsStripping(false);
    }
  }

  const hasExifData = exif && Object.keys(exif).length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="07 · Inspector"
            title="Metadata & EXIF"
            description="Examine camera capture hardware, exposure configurations, lens optics, and embedded GPS coordinates. Strip all identifying metadata with one click for privacy safety."
            badge="Privacy Inspector"
          />

          {!file ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/*"
                multiple={false}
                onFiles={handleFile}
                label="Drop an image to inspect metadata, or click to browse"
                hint="JPEG · PNG · WebP · Photos from smartphones or digital cameras contain the richest EXIF data"
              />
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              {/* Header Overview Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                  />
                  <div>
                    <h2 className="font-semibold text-text text-[14px] truncate max-w-[150px] xs:max-w-xs sm:max-w-md">
                      {file.name}
                    </h2>
                    <p className="font-mono text-[11px] text-muted">
                      {formatBytes(file.size)} · {fileMeta?.width} × {fileMeta?.height} px · {fileMeta?.aspectRatio}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileMeta(null);
                      setExif(null);
                    }}
                    className="h-9 px-3 rounded-lg border border-border bg-bg text-muted hover:text-text hover:border-border-hover text-[12px] font-medium transition-colors"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={handleStripMetadata}
                    disabled={isStripping}
                    className="h-9 px-3.5 sm:px-4 rounded-lg bg-accent text-white hover:bg-accent-strong text-[12px] font-medium transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 1.25V1.75A1.75 1.75 0 0 0 9.25 0h-2.5A1.75 1.75 0 0 0 5 1.75V3H1.75a.75.75 0 0 0 0 1.5H2v9A2.5 2.5 0 0 0 4.5 16h7a2.5 2.5 0 0 0 2.5-2.5V4.5h.25a.75.75 0 0 0 0-1.5H11ZM3.5 4.5h9v9a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-9ZM6.25 7a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5A.75.75 0 0 0 6.25 7Zm3.5 0a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5A.75.75 0 0 0 9.75 7Z"/>
                    </svg>
                    <span>{isStripping ? "Sanitizing…" : "Strip All EXIF (Sanitize)"}</span>
                  </button>
                </div>
              </div>

              {/* Technical Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Properties */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1.75 2.5h10.5a.25.25 0 0 1 .25.25v10.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75a.25.25 0 0 1 .25-.25ZM0 2.75C0 1.784.784 1 1.75 1h10.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 12.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75Z"/>
                    </svg>
                    <h3 className="text-[13px] font-semibold text-text">File Information</h3>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[12px]">
                    <div>
                      <dt className="text-muted text-[11px]">MIME Type</dt>
                      <dd className="text-text mt-0.5">{fileMeta?.type}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">File Size</dt>
                      <dd className="text-text mt-0.5">{formatBytes(fileMeta?.size || 0)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Dimensions</dt>
                      <dd className="text-text mt-0.5">{fileMeta?.width} × {fileMeta?.height} px</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-[11px]">Aspect Ratio</dt>
                      <dd className="text-text mt-0.5">{fileMeta?.aspectRatio}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted text-[11px]">Last Modified</dt>
                      <dd className="text-text mt-0.5">{fileMeta?.lastModified}</dd>
                    </div>
                  </dl>
                </div>

                {/* Camera Hardware Specs */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-1.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/>
                      <path d="M4.32 3.243A.75.75 0 0 1 5.01 2.5h5.98a.75.75 0 0 1 .69.743l.235 1.257h2.335A1.75 1.75 0 0 1 16 6.25v7A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-7A1.75 1.75 0 0 1 1.75 4.5h2.335l.235-1.257ZM14.5 6.25a.25.25 0 0 0-.25-.25H11.5a.75.75 0 0 1-.737-.612L10.457 4H5.543l-.306 1.388A.75.75 0 0 1 4.5 6H1.75a.25.25 0 0 0-.25.25v7c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-7Z"/>
                    </svg>
                    <h3 className="text-[13px] font-semibold text-text">Camera & Lens</h3>
                  </div>

                  {hasExifData ? (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[12px]">
                      <div>
                        <dt className="text-muted text-[11px]">Make</dt>
                        <dd className="text-text mt-0.5">{exif?.make || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted text-[11px]">Model</dt>
                        <dd className="text-text mt-0.5">{exif?.model || "—"}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted text-[11px]">Lens Model</dt>
                        <dd className="text-text mt-0.5 truncate">{exif?.lensModel || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted text-[11px]">Software</dt>
                        <dd className="text-text mt-0.5 truncate">{exif?.software || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted text-[11px]">Orientation</dt>
                        <dd className="text-text mt-0.5">{exif?.orientation || "Normal"}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="py-6 text-center text-muted font-mono text-[12px]">
                      No camera hardware tags embedded in this file.
                    </div>
                  )}
                </div>

                {/* Exposure Diagnostics */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Z"/>
                    </svg>
                    <h3 className="text-[13px] font-semibold text-text">Exposure Parameters</h3>
                  </div>

                  {hasExifData ? (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[12px]">
                      <div>
                        <dt className="text-muted text-[11px]">Aperture</dt>
                        <dd className="text-text mt-0.5">{exif?.fNumber ? `f/${exif.fNumber}` : "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted text-[11px]">Shutter Speed</dt>
                        <dd className="text-text mt-0.5">{exif?.exposureTime || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted text-[11px]">ISO Speed</dt>
                        <dd className="text-text mt-0.5">{exif?.iso || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted text-[11px]">Focal Length</dt>
                        <dd className="text-text mt-0.5">{exif?.focalLength ? `${exif.focalLength} mm` : "—"}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted text-[11px]">Date Taken</dt>
                        <dd className="text-text mt-0.5">{exif?.dateTimeOriginal || "—"}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="py-6 text-center text-muted font-mono text-[12px]">
                      No exposure parameters recorded.
                    </div>
                  )}
                </div>

                {/* GPS & Location Coordinates */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                      <path d="m12.596 3.104-9.5 4.5a.75.75 0 0 0 .044 1.373l4.31 1.724 1.724 4.31a.75.75 0 0 0 1.373.044l4.5-9.5a.75.75 0 0 0-.951-.951L12.596 3.104ZM8.828 9.172a.75.75 0 0 0-.656.656l-1.144 2.86-1.127-2.817a.75.75 0 0 0-.472-.472L2.612 8.272l2.86-1.144a.75.75 0 0 0 .656-.656l1.144-2.86 1.127 2.817a.75.75 0 0 0 .472.472l2.817 1.127-2.86 1.144Z"/>
                    </svg>
                    <h3 className="text-[13px] font-semibold text-text">GPS Coordinates</h3>
                  </div>

                  {exif?.gps?.latitude && exif?.gps?.longitude ? (
                    <div className="space-y-4">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[12px]">
                        <div>
                          <dt className="text-muted text-[11px]">Latitude</dt>
                          <dd className="text-text mt-0.5">{exif.gps.latitude.toFixed(6)}°</dd>
                        </div>
                        <div>
                          <dt className="text-muted text-[11px]">Longitude</dt>
                          <dd className="text-text mt-0.5">{exif.gps.longitude.toFixed(6)}°</dd>
                        </div>
                      </dl>
                      <a
                        href={exif.gps.mapUrl || `https://www.google.com/maps?q=${exif.gps.latitude},${exif.gps.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-[11px] font-mono transition-colors"
                      >
                        <span>Open coordinates in Google Maps</span>
                        <span>↗</span>
                      </a>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-muted font-mono text-[12px]">
                      No embedded GPS or location coordinates found.
                    </div>
                  )}
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
