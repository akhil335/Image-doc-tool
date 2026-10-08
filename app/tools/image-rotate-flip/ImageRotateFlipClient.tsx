"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import { canvasToBlob, rotateAndFlipImage } from "@/lib/canvasUtils";
import { saveAs } from "file-saver";
import JSZip from "jszip";

interface RotatableImage {
  id: string;
  file: File;
  previewUrl: string;
  angle: number;
  flipH: boolean;
  flipV: boolean;
}

export default function ImageRotateFlipClient() {
  const [items, setItems] = useState<RotatableImage[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function handleAddFiles(files: File[]) {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (!valid.length) {
      setToastMsg("Please select valid image files.");
      return;
    }

    const loaded: RotatableImage[] = valid.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      angle: 0,
      flipH: false,
      flipV: false,
    }));

    setItems((prev) => [...prev, ...loaded]);
    setToastMsg(`Added ${loaded.length} image${loaded.length > 1 ? "s" : ""}.`);
  }

  const activeItem = items[activeIdx] || items[0];

  function updateActive(transforms: Partial<Pick<RotatableImage, "angle" | "flipH" | "flipV">>) {
    if (!activeItem) return;
    setItems((prev) =>
      prev.map((it, idx) => (idx === activeIdx ? { ...it, ...transforms } : it))
    );
  }

  function applyToAll(transforms: Partial<Pick<RotatableImage, "angle" | "flipH" | "flipV">>) {
    setItems((prev) => prev.map((it) => ({ ...it, ...transforms })));
    setToastMsg("Applied transformation to all queued images.");
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
    if (activeIdx >= items.length - 1) {
      setActiveIdx(Math.max(0, items.length - 2));
    }
  }

  function clearAll() {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
    setActiveIdx(0);
  }

  async function exportItem(item: RotatableImage): Promise<Blob> {
    const img = await loadImage(item.previewUrl);
    const canvas = rotateAndFlipImage(img, item.angle, item.flipH, item.flipV);
    if (format === "image/jpeg") {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    return await canvasToBlob(canvas, format, 0.95);
  }

  async function handleDownloadActive() {
    if (!activeItem) return;
    setIsProcessing(true);
    try {
      const blob = await exportItem(activeItem);
      const baseName = getFileNameWithoutExtension(activeItem.file.name);
      const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
      saveAs(blob, `${baseName}-transformed.${ext}`);
      setToastMsg("Downloaded transformed image.");
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to export image.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDownloadAllZip() {
    if (!items.length) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      for (const it of items) {
        const blob = await exportItem(it);
        const baseName = getFileNameWithoutExtension(it.file.name);
        const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
        zip.file(`${baseName}-transformed.${ext}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "docst.tech-rotated-images.zip");
      setToastMsg("Downloaded all images as ZIP archive.");
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to bundle ZIP archive.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="06 · Transform"
            title="Rotate & Flip"
            description="Lossless canvas orientation adjustment with 90° clockwise/counter-clockwise rotations, horizontal mirroring, and vertical flipping. Batch process multiple files simultaneously."
            badge="Studio Orient"
          />

          {items.length === 0 ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/*"
                multiple
                onFiles={handleAddFiles}
                label="Drop images to rotate or flip, or click to browse"
                hint="PNG · JPG · WebP · AVIF · Single or batch files"
              />
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Viewport Preview Stage (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                    {/* Viewport Header */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-surface/50 text-[12px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        <span className="font-mono text-[11px] text-muted truncate max-w-[130px] xs:max-w-[200px]">
                          {activeItem?.file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px]">
                        <span className="text-muted hidden xs:inline">Orientation:</span>
                        <span className="text-accent font-semibold">
                          {activeItem ? `${activeItem.angle}°` : "0°"}
                          {activeItem?.flipH && " · H"}
                          {activeItem?.flipV && " · V"}
                        </span>
                      </div>
                    </div>

                    {/* Transform Canvas Display */}
                    <div className="relative flex min-h-[380px] max-h-[480px] items-center justify-center bg-black/40 p-6 overflow-hidden pattern-dots">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeItem?.previewUrl}
                        alt="Preview"
                        className="max-h-[360px] max-w-full object-contain rounded shadow-lg transition-transform duration-200"
                        style={{
                          transform: `rotate(${activeItem?.angle || 0}deg) scaleX(${activeItem?.flipH ? -1 : 1}) scaleY(${activeItem?.flipV ? -1 : 1})`,
                        }}
                      />

                      {/* Floating Angle Indicator */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-border/60 bg-surface/90 px-2.5 py-1 text-[11px] font-mono backdrop-blur-sm shadow-xs">
                        <span className="text-muted">Angle:</span>
                        <span className="text-accent font-semibold">{activeItem?.angle || 0}°</span>
                      </div>
                    </div>
                  </div>

                  {/* Batch Filmstrip / List */}
                  <div className="rounded-xl border border-border bg-surface p-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">Queued Images</span>
                        <span className="rounded-full bg-accent/10 text-accent font-mono text-[10px] px-2 py-0.5">
                          {items.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer text-[11px] text-accent hover:underline">
                          + Add more
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) handleAddFiles(Array.from(e.target.files));
                            }}
                          />
                        </label>
                        <button
                          onClick={clearAll}
                          className="text-[11px] text-muted hover:text-red-400 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto py-1">
                      {items.map((it, idx) => {
                        const isSel = idx === activeIdx;
                        return (
                          <div
                            key={it.id}
                            onClick={() => setActiveIdx(idx)}
                            className={`group relative flex items-center gap-2 rounded-lg border px-2.5 py-1.5 cursor-pointer shrink-0 transition-all ${
                              isSel
                                ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                                : "border-border bg-bg/50 hover:border-border-hover hover:bg-surface"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={it.previewUrl}
                              alt=""
                              className="h-7 w-7 rounded object-cover border border-border/40 transition-transform duration-200"
                              style={{
                                transform: `rotate(${it.angle}deg) scaleX(${it.flipH ? -1 : 1}) scaleY(${it.flipV ? -1 : 1})`,
                              }}
                            />
                            <div className="min-w-0 pr-4">
                              <p className="truncate text-[11px] font-medium text-text max-w-[90px]">
                                {it.file.name}
                              </p>
                              <p className="font-mono text-[9px] text-muted">
                                {it.angle}° {it.flipH && "H"} {it.flipV && "V"}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(it.id);
                              }}
                              className="absolute right-1 top-1 text-muted/40 hover:text-red-400 text-[10px] p-0.5"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Transform Controls Inspector (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7 7 0 0 1 1.05 8.84a.75.75 0 0 1 .655-.835Z"/>
                        </svg>
                        <h3 className="text-[13px] font-semibold text-text">Orientation Controls</h3>
                      </div>
                      <button
                        onClick={() => updateActive({ angle: 0, flipH: false, flipV: false })}
                        className="text-[11px] font-mono text-muted hover:text-text transition-colors"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Rotation Buttons */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">Rotate Angle</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updateActive({ angle: ((activeItem?.angle || 0) - 90 + 360) % 360 })}
                          className="h-8 rounded-lg border border-border bg-bg/50 text-[11px] font-mono text-text hover:border-accent hover:bg-surface transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>↺</span> -90° CCW
                        </button>
                        <button
                          type="button"
                          onClick={() => updateActive({ angle: ((activeItem?.angle || 0) + 90) % 360 })}
                          className="h-8 rounded-lg border border-border bg-bg/50 text-[11px] font-mono text-text hover:border-accent hover:bg-surface transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>↻</span> +90° CW
                        </button>
                        <button
                          type="button"
                          onClick={() => updateActive({ angle: ((activeItem?.angle || 0) + 180) % 360 })}
                          className="h-8 rounded-lg border border-border bg-bg/50 text-[11px] font-mono text-text hover:border-accent hover:bg-surface transition-all flex items-center justify-center gap-1.5"
                        >
                          180° Invert
                        </button>
                      </div>
                    </div>

                    {/* Flip Controls */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">Mirror / Flip</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateActive({ flipH: !activeItem?.flipH })}
                          className={`h-8 rounded-lg border text-[11px] font-mono transition-all flex items-center justify-center gap-2 ${
                            activeItem?.flipH
                              ? "border-accent bg-accent/10 text-accent font-semibold"
                              : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                          }`}
                        >
                          <span>↔</span> Flip Horizontal
                        </button>
                        <button
                          type="button"
                          onClick={() => updateActive({ flipV: !activeItem?.flipV })}
                          className={`h-8 rounded-lg border text-[11px] font-mono transition-all flex items-center justify-center gap-2 ${
                            activeItem?.flipV
                              ? "border-accent bg-accent/10 text-accent font-semibold"
                              : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                          }`}
                        >
                          <span>↕</span> Flip Vertical
                        </button>
                      </div>
                    </div>

                    {/* Batch Apply Quick Action */}
                    {items.length > 1 && (
                      <div className="pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() =>
                            applyToAll({
                              angle: activeItem?.angle || 0,
                              flipH: activeItem?.flipH || false,
                              flipV: activeItem?.flipV || false,
                            })
                          }
                          className="w-full h-8 rounded-lg border border-dashed border-border hover:border-accent text-muted hover:text-accent text-[11px] font-mono transition-colors"
                        >
                          Apply current transform to all {items.length} images
                        </button>
                      </div>
                    )}

                    {/* Export Format */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">Export Format</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as "image/png" | "image/jpeg" | "image/webp")}
                        className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="image/png">PNG · Lossless</option>
                        <option value="image/jpeg">JPG · Standard</option>
                        <option value="image/webp">WebP · High efficiency</option>
                      </select>
                    </div>

                    {/* Action Execution */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <button
                        onClick={handleDownloadActive}
                        disabled={isProcessing}
                        className="w-full h-10 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        {isProcessing ? "Processing…" : `Download Selected (${activeItem?.angle || 0}°)`}
                      </button>

                      {items.length > 1 && (
                        <button
                          onClick={handleDownloadAllZip}
                          disabled={isProcessing}
                          className="w-full h-8 rounded-lg border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-[12px] font-medium transition-colors"
                        >
                          Download All as ZIP ({items.length})
                        </button>
                      )}
                    </div>
                  </div>
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
