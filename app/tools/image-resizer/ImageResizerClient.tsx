"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import ProgressBar from "@/components/ProgressBar";
import Toast from "@/components/Toast";
import { formatBytes, getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import { canvasToBlob, resizeImage } from "@/lib/canvasUtils";
import { saveAs } from "file-saver";
import JSZip from "jszip";

interface ResizableImage {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  resizedBlob: Blob | null;
  resizedUrl: string | null;
  status: "idle" | "processing" | "done" | "error";
}

const PRESETS = [
  { label: "1080p (FHD)", w: 1920, h: 1080, cat: "Desktop" },
  { label: "720p (HD)", w: 1280, h: 720, cat: "Desktop" },
  { label: "1:1 Square", w: 1080, h: 1080, cat: "Social" },
  { label: "4:5 Portrait", w: 1080, h: 1350, cat: "Social" },
  { label: "9:16 Story", w: 1080, h: 1920, cat: "Social" },
  { label: "4:3 Standard", w: 800, h: 600, cat: "Standard" },
];

export default function ImageResizerClient() {
  const [items, setItems] = useState<ResizableImage[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [globalWidth, setGlobalWidth] = useState<number>(1280);
  const [globalHeight, setGlobalHeight] = useState<number>(720);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const [exportFormat, setExportFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  async function handleAddFiles(files: File[]) {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (!valid.length) {
      setToastMsg("Please select valid image files.");
      return;
    }

    const loaded: ResizableImage[] = [];
    for (const f of valid) {
      const url = URL.createObjectURL(f);
      try {
        const img = await loadImage(url);
        loaded.push({
          id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file: f,
          previewUrl: url,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          targetWidth: globalWidth,
          targetHeight: globalHeight,
          resizedBlob: null,
          resizedUrl: null,
          status: "idle",
        });

        if (items.length === 0 && loaded.length === 1) {
          setGlobalWidth(img.naturalWidth);
          setGlobalHeight(img.naturalHeight);
          setAspectRatio(img.naturalWidth / img.naturalHeight);
        }
      } catch {
        URL.revokeObjectURL(url);
      }
    }

    setItems((prev) => [...prev, ...loaded]);
  }

  function handleWidthChange(w: number) {
    setGlobalWidth(w);
    if (lockAspectRatio && aspectRatio > 0) {
      setGlobalHeight(Math.max(1, Math.round(w / aspectRatio)));
    }
  }

  function handleHeightChange(h: number) {
    setGlobalHeight(h);
    if (lockAspectRatio && aspectRatio > 0) {
      setGlobalWidth(Math.max(1, Math.round(h * aspectRatio)));
    }
  }

  function applyScalePercentage(pct: number) {
    const active = items[activeIdx] || items[0];
    if (active) {
      const nw = Math.max(1, Math.round(active.originalWidth * (pct / 100)));
      const nh = Math.max(1, Math.round(active.originalHeight * (pct / 100)));
      setGlobalWidth(nw);
      setGlobalHeight(nh);
    }
  }

  function applyPreset(w: number, h: number) {
    setGlobalWidth(w);
    setGlobalHeight(h);
    setAspectRatio(w / h);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) {
        URL.revokeObjectURL(it.previewUrl);
        if (it.resizedUrl) URL.revokeObjectURL(it.resizedUrl);
      }
      return prev.filter((x) => x.id !== id);
    });
    if (activeIdx >= items.length - 1) {
      setActiveIdx(Math.max(0, items.length - 2));
    }
  }

  function clearAll() {
    items.forEach((it) => {
      URL.revokeObjectURL(it.previewUrl);
      if (it.resizedUrl) URL.revokeObjectURL(it.resizedUrl);
    });
    setItems([]);
    setActiveIdx(0);
  }

  async function handleResizeAll() {
    if (!items.length || isProcessing) return;
    setIsProcessing(true);
    setProgress(0);

    let completed = 0;
    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      setItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: "processing" } : it))
      );

      try {
        const img = await loadImage(item.previewUrl);
        const canvas = resizeImage(img, globalWidth, globalHeight);
        const blob = await canvasToBlob(canvas, exportFormat, 0.92);
        const url = URL.createObjectURL(blob);

        updated[i] = {
          ...item,
          targetWidth: globalWidth,
          targetHeight: globalHeight,
          resizedBlob: blob,
          resizedUrl: url,
          status: "done",
        };
      } catch (err) {
        console.error(err);
        updated[i] = { ...item, status: "error" };
      }

      completed++;
      setProgress(Math.round((completed / items.length) * 100));
      setItems([...updated]);
    }

    setIsProcessing(false);
    setToastMsg(`Resized ${completed} image${completed > 1 ? "s" : ""} to ${globalWidth} × ${globalHeight} px`);
  }

  function downloadItem(item: ResizableImage) {
    if (!item.resizedBlob) return;
    const baseName = getFileNameWithoutExtension(item.file.name);
    const ext = exportFormat === "image/png" ? "png" : exportFormat === "image/jpeg" ? "jpg" : "webp";
    saveAs(item.resizedBlob, `${baseName}-${item.targetWidth}x${item.targetHeight}.${ext}`);
  }

  async function downloadAllZip() {
    const ready = items.filter((i) => i.resizedBlob);
    if (!ready.length) return;

    const zip = new JSZip();
    ready.forEach((item) => {
      const baseName = getFileNameWithoutExtension(item.file.name);
      const ext = exportFormat === "image/png" ? "png" : exportFormat === "image/jpeg" ? "jpg" : "webp";
      zip.file(`${baseName}-${item.targetWidth}x${item.targetHeight}.${ext}`, item.resizedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `docst.tech-resized-${globalWidth}x${globalHeight}.zip`);
    setToastMsg("ZIP archive downloaded.");
  }

  const activeItem = items[activeIdx] || items[0];
  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="04 · Resizer"
            title="Image Resizer"
            description="High-precision bicubic image scaling with aspect ratio lock, percentage scaling, and social media presets. Process singles or entire batches instantly in-browser."
            badge="Studio Scale"
          />

          {items.length === 0 ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/*"
                multiple
                onFiles={handleAddFiles}
                label="Drop images to resize, or click to browse"
                hint="PNG · JPG · WebP · AVIF · Single or batch files"
              />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[12px] text-muted">
                <span>Popular targets:</span>
                {PRESETS.slice(0, 4).map((p) => (
                  <span key={p.label} className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px]">
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              {/* Studio Workspace Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Preview Canvas & Batch Strip (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  {/* Active Preview Viewport */}
                  <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                    {/* Viewport Header */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-surface/50 text-[12px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        <span className="font-mono text-[11px] text-muted truncate max-w-[130px] xs:max-w-[200px]">
                          {activeItem?.file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[11px]">
                        <span className="text-muted">
                          {activeItem?.originalWidth} × {activeItem?.originalHeight}
                        </span>
                        <span className="text-muted/40">→</span>
                        <span className="text-accent font-medium">
                          {globalWidth} × {globalHeight} px
                        </span>
                      </div>
                    </div>

                    {/* Canvas Stage */}
                    <div className="relative flex min-h-[380px] max-h-[480px] items-center justify-center bg-black/40 p-6 overflow-hidden pattern-dots">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeItem?.resizedUrl || activeItem?.previewUrl}
                        alt="Preview"
                        className="max-h-[360px] max-w-full object-contain rounded shadow-lg transition-all"
                      />

                      {/* Dimension Pill Overlay */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md border border-border/60 bg-surface/90 px-2.5 py-1 text-[11px] font-mono backdrop-blur-sm shadow-xs">
                        <span className="text-muted">Scale target:</span>
                        <span className="text-accent font-semibold">{globalWidth} × {globalHeight}</span>
                      </div>

                      {activeItem?.status === "done" && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-accent/90 text-white px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm shadow-xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                          </svg>
                          Resized
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Batch Filmstrip / List */}
                  <div className="rounded-xl border border-border bg-surface p-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">Queued Files</span>
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
                              src={it.resizedUrl || it.previewUrl}
                              alt=""
                              className="h-7 w-7 rounded object-cover border border-border/40"
                            />
                            <div className="min-w-0 pr-4">
                              <p className="truncate text-[11px] font-medium text-text max-w-[90px]">
                                {it.file.name}
                              </p>
                              <p className="font-mono text-[9px] text-muted">
                                {it.originalWidth}×{it.originalHeight}
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

                {/* Right: Inspector Settings (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M1.75 3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75ZM0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5Z"/>
                        </svg>
                        <h3 className="text-[13px] font-semibold text-text">Dimension Settings</h3>
                      </div>
                      <span className="font-mono text-[11px] text-muted">Bicubic</span>
                    </div>

                    {/* Width & Height Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-muted mb-1.5">Width (px)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={globalWidth}
                            onChange={(e) => handleWidthChange(Math.max(1, Number(e.target.value)))}
                            className="w-full h-9 rounded-lg border border-border bg-bg px-3 font-mono text-[13px] text-text focus:border-accent focus:outline-none transition-colors"
                          />
                          <span className="absolute right-2.5 top-2 text-[10px] font-mono text-muted">PX</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-muted mb-1.5">Height (px)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={globalHeight}
                            onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                            className="w-full h-9 rounded-lg border border-border bg-bg px-3 font-mono text-[13px] text-text focus:border-accent focus:outline-none transition-colors"
                          />
                          <span className="absolute right-2.5 top-2 text-[10px] font-mono text-muted">PX</span>
                        </div>
                      </div>
                    </div>

                    {/* Lock Aspect Ratio Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-muted hover:text-text">
                        <input
                          type="checkbox"
                          checked={lockAspectRatio}
                          onChange={(e) => {
                            setLockAspectRatio(e.target.checked);
                            if (e.target.checked && globalHeight > 0) {
                              setAspectRatio(globalWidth / globalHeight);
                            }
                          }}
                          className="accent-accent h-3.5 w-3.5 rounded"
                        />
                        <span>Lock aspect ratio</span>
                      </label>
                      <span className="font-mono text-[11px] text-muted/60">
                        {aspectRatio > 0 ? (aspectRatio).toFixed(2) : "1.00"} : 1
                      </span>
                    </div>

                    {/* Percentage Scale Pills */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">Scale Preset</span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {[25, 50, 75, 100, 150, 200].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => applyScalePercentage(pct)}
                            className="h-7 rounded-md border border-border bg-bg/60 text-[11px] font-mono text-muted hover:text-text hover:border-accent hover:bg-surface transition-all"
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Resolution Presets */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">Standard Resolutions</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRESETS.map((p) => {
                          const isActive = globalWidth === p.w && globalHeight === p.h;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => applyPreset(p.w, p.h)}
                              className={`h-8 rounded-lg border px-2.5 text-left text-[11px] font-mono transition-all flex items-center justify-between ${
                                isActive
                                  ? "border-accent bg-accent/10 text-accent font-semibold"
                                  : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                              }`}
                            >
                              <span>{p.label}</span>
                              <span className="text-[9px] opacity-60">{p.w}×{p.h}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Format Selector */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">Export Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as "image/png" | "image/jpeg" | "image/webp")}
                        className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="image/png">PNG · Lossless with transparency</option>
                        <option value="image/jpeg">JPG · Web standard compressed</option>
                        <option value="image/webp">WebP · Modern high efficiency</option>
                      </select>
                    </div>

                    {/* Action Execution */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <button
                        onClick={handleResizeAll}
                        disabled={isProcessing}
                        className="w-full h-10 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Resizing {items.length} images…</span>
                          </>
                        ) : (
                          <>
                            <span>Resize {items.length > 1 ? `All (${items.length})` : "Image"}</span>
                            <span className="text-[11px] font-mono opacity-80">({globalWidth} × {globalHeight})</span>
                          </>
                        )}
                      </button>

                      {doneCount > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {activeItem?.resizedBlob && (
                            <button
                              onClick={() => downloadItem(activeItem)}
                              className="h-8 rounded-lg border border-border bg-surface text-text hover:border-accent hover:text-accent text-[12px] font-medium transition-colors"
                            >
                              Download Selected
                            </button>
                          )}
                          {doneCount > 1 ? (
                            <button
                              onClick={downloadAllZip}
                              className="h-8 rounded-lg border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-[12px] font-medium transition-colors col-span-1"
                            >
                              Download ZIP ({doneCount})
                            </button>
                          ) : (
                            <div />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="rounded-xl border border-border bg-surface p-4">
                      <ProgressBar
                        progress={progress}
                        label="Processing batch images..."
                        subtext={`${progress}%`}
                      />
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
