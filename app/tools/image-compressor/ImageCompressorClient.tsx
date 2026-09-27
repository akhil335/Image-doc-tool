"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import ProgressBar from "@/components/ProgressBar";
import BeforeAfterPreview from "@/components/BeforeAfterPreview";
import Toast from "@/components/Toast";
import { formatBytes, calculateSavings, getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import { canvasToBlob, createCanvas } from "@/lib/canvasUtils";
import { saveAs } from "file-saver";
import JSZip from "jszip";

interface CompressedFile {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number | null;
  status: "idle" | "processing" | "done" | "error";
  error?: string;
}

export default function ImageCompressorClient() {
  const [items, setItems] = useState<CompressedFile[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<"auto" | "webp" | "jpeg" | "png">("auto");
  const [maxDimension, setMaxDimension] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) {
      setToastMsg("Please select valid image files.");
      return;
    }

    const newFiles: CompressedFile[] = valid.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      compressedBlob: null,
      compressedUrl: null,
      compressedSize: null,
      status: "idle",
    }));

    setItems((prev) => [...prev, ...newFiles]);
  }, []);

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    items.forEach((i) => {
      URL.revokeObjectURL(i.previewUrl);
      if (i.compressedUrl) URL.revokeObjectURL(i.compressedUrl);
    });
    setItems([]);
    setProgress(0);
  }

  async function compressSingle(item: CompressedFile): Promise<{ blob: Blob; url: string }> {
    const img = await loadImage(item.previewUrl);

    let targetW = img.naturalWidth;
    let targetH = img.naturalHeight;

    if (maxDimension > 0 && (targetW > maxDimension || targetH > maxDimension)) {
      if (targetW > targetH) {
        targetH = Math.round((targetH / targetW) * maxDimension);
        targetW = maxDimension;
      } else {
        targetW = Math.round((targetW / targetH) * maxDimension);
        targetH = maxDimension;
      }
    }

    const { canvas, ctx } = createCanvas(targetW, targetH);

    let mimeType = item.file.type;
    if (format === "webp") mimeType = "image/webp";
    else if (format === "jpeg") mimeType = "image/jpeg";
    else if (format === "png") mimeType = "image/png";
    else if (!["image/jpeg", "image/webp", "image/png"].includes(mimeType)) {
      mimeType = "image/jpeg";
    }

    if (mimeType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
    }

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const q = mimeType === "image/png" ? undefined : quality / 100;
    const blob = await canvasToBlob(canvas, mimeType, q);
    const url = URL.createObjectURL(blob);
    return { blob, url };
  }

  async function handleCompressAll() {
    if (items.length === 0 || isCompressing) return;
    setIsCompressing(true);
    setProgress(0);

    let completed = 0;
    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      setItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: "processing" } : it))
      );

      try {
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
        const { blob, url } = await compressSingle(item);
        updated[i] = {
          ...item,
          compressedBlob: blob,
          compressedUrl: url,
          compressedSize: blob.size,
          status: "done",
        };
      } catch (err: unknown) {
        console.error(err);
        updated[i] = {
          ...item,
          status: "error",
          error: err instanceof Error ? err.message : "Failed to compress",
        };
      }

      completed++;
      setProgress(Math.round((completed / items.length) * 100));
      setItems([...updated]);
    }

    setIsCompressing(false);
    setToastMsg(`Compressed ${completed} image${completed > 1 ? "s" : ""}.`);
  }

  function downloadItem(item: CompressedFile) {
    if (!item.compressedBlob) return;
    const baseName = getFileNameWithoutExtension(item.file.name);
    const ext = item.compressedBlob.type === "image/webp" ? "webp" : item.compressedBlob.type === "image/jpeg" ? "jpg" : "png";
    saveAs(item.compressedBlob, `${baseName}-compressed.${ext}`);
  }

  async function downloadAllZip() {
    const ready = items.filter((i) => i.compressedBlob);
    if (ready.length === 0) return;

    const zip = new JSZip();
    ready.forEach((item) => {
      const baseName = getFileNameWithoutExtension(item.file.name);
      const ext = item.compressedBlob!.type === "image/webp" ? "webp" : item.compressedBlob!.type === "image/jpeg" ? "jpg" : "png";
      zip.file(`${baseName}-compressed.${ext}`, item.compressedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "compressed-images.zip");
    setToastMsg("ZIP archive downloaded.");
  }

  const activeItem = items[activePreviewIndex] || items[0];
  const readyCount = items.filter((i) => i.status === "done").length;
  const activeSavings = activeItem && activeItem.compressedSize !== null
    ? calculateSavings(activeItem.originalSize, activeItem.compressedSize)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <ToolHeader
            tag="02"
            title="Image Compressor"
            description="Reduce image size instantly. Everything happens securely inside your browser."
            badge="Client-side"
          />

          {items.length === 0 ? (
            /* PRE-UPLOAD FOCUSED WORKSPACE */
            <div className="max-w-2xl mx-auto mt-6 animate-fade-in">
              <Dropzone
                accept="image/*"
                multiple
                onFiles={handleAddFiles}
                label="Drop images to compress"
                hint="or click to browse from device"
              />
            </div>
          ) : (
            /* POST-UPLOAD STUDIO WORKSPACE: Preview on Left, Settings on Right */
            <div className="mt-6 space-y-6 animate-fade-in">
              {/* Top status bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 rounded-xl border border-border bg-surface px-3 sm:px-5 py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-sans text-[13px] sm:text-[14px] font-medium text-text">
                    {items.length} file{items.length > 1 ? "s" : ""} selected
                  </span>
                  {readyCount > 0 && (
                    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold text-accent">
                      {readyCount} compressed
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={clearAll}
                    disabled={isCompressing}
                    className="h-8 rounded-md px-2.5 sm:px-3 text-[12px] font-medium text-muted hover:text-danger hover:bg-surface-hover transition-colors"
                  >
                    Clear all
                  </button>
                  {readyCount > 1 && (
                    <button
                      onClick={downloadAllZip}
                      className="h-8 rounded-md border border-border bg-surface px-2.5 sm:px-3 text-[12px] font-medium text-text hover:border-accent hover:text-accent transition-colors"
                    >
                      Download all (.zip)
                    </button>
                  )}
                  <button
                    onClick={handleCompressAll}
                    disabled={isCompressing}
                    className="h-8 rounded-md bg-accent px-3.5 sm:px-4 text-[12px] font-medium text-white shadow-sm shadow-accent/20 hover:bg-accent-strong transition-all disabled:opacity-50"
                  >
                    {isCompressing ? "Compressing…" : readyCount > 0 ? "Re-compress all" : "Compress all images"}
                  </button>
                </div>
              </div>

              {isCompressing && (
                <ProgressBar
                  progress={progress}
                  label="Compressing images..."
                  subtext={`${progress}%`}
                />
              )}

              {/* Two-Column Studio Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
                {/* Left: Preview Panel */}
                <div className="rounded-xl border border-border bg-surface p-3 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                    <span className="font-sans text-[13px] font-medium text-text">
                      Active: <span className="text-muted font-normal max-w-[140px] xs:max-w-xs truncate inline-block align-bottom">{activeItem.file.name}</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      Original: {formatBytes(activeItem.originalSize)}
                    </span>
                  </div>

                  {/* Interactive Before/After Preview */}
                  {activeItem.compressedUrl ? (
                    <BeforeAfterPreview
                      beforeUrl={activeItem.previewUrl}
                      afterUrl={activeItem.compressedUrl}
                      beforeLabel="Original"
                      afterLabel="Compressed"
                      beforeStats={formatBytes(activeItem.originalSize)}
                      afterStats={formatBytes(activeItem.compressedSize || 0)}
                      savingsBadge={
                        activeSavings?.isSmaller
                          ? `Saved ${activeSavings.percentage}% (${formatBytes(activeSavings.savedBytes)})`
                          : undefined
                      }
                    />
                  ) : (
                    <div className="flex h-72 sm:h-80 w-full items-center justify-center rounded-lg bg-bg/60 p-4 border border-border/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeItem.previewUrl}
                        alt="Original preview"
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    </div>
                  )}

                  {/* Size reduction callout */}
                  {activeItem.compressedSize !== null && activeSavings && (
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-[13px]">
                      <div className="space-y-0.5">
                        <span className="text-muted text-[12px]">Result summary:</span>
                        <div className="font-mono text-[13px]">
                          <span className="text-muted line-through mr-1.5">{formatBytes(activeItem.originalSize)}</span>
                          → <span className="font-semibold text-text ml-1">{formatBytes(activeItem.compressedSize)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[13px] sm:text-[14px] font-bold text-accent">
                          -{activeSavings.percentage}% smaller
                        </span>
                        <button
                          onClick={() => downloadItem(activeItem)}
                          className="h-8 rounded-md bg-accent px-3 font-sans text-[12px] font-medium text-white hover:bg-accent-strong"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Multi-item selector list */}
                  {items.length > 1 && (
                    <div className="pt-2">
                      <span className="block font-mono text-[11px] uppercase tracking-wider text-muted mb-2">
                        Queue ({items.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {items.map((it, idx) => (
                          <div
                            key={it.id}
                            onClick={() => setActivePreviewIndex(idx)}
                            className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-all ${
                              idx === activePreviewIndex
                                ? "border-accent bg-accent/5 ring-1 ring-accent"
                                : "border-border/70 bg-bg hover:border-accent/40"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={it.previewUrl} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-medium text-text">{it.file.name}</p>
                              <p className="font-mono text-[10px] text-muted">{formatBytes(it.originalSize)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Settings Inspector */}
                <div className="rounded-xl border border-border bg-surface p-5 space-y-6">
                  <h3 className="font-sans text-[14px] font-semibold text-text border-b border-border/70 pb-3">
                    Compression Settings
                  </h3>

                  {/* Presets */}
                  <div>
                    <label className="block text-[12px] font-medium text-text mb-2">
                      Target Preset
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                      {[
                        { label: "Balanced (75%)", val: 75 },
                        { label: "High Quality (88%)", val: 88 },
                        { label: "Max Compression (40%)", val: 40 },
                        { label: "Near-lossless (95%)", val: 95 },
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => setQuality(p.val)}
                          className={`rounded-md border p-2 text-left transition-colors ${
                            quality === p.val
                              ? "border-accent bg-accent/10 text-accent font-medium"
                              : "border-border/80 text-muted hover:border-accent/40 hover:text-text"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fine Quality Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[12px] mb-2">
                      <span className="font-medium text-text">Quality Level</span>
                      <span className="font-mono text-accent font-semibold">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-1.5 rounded-lg accent-accent cursor-pointer bg-bg border border-border/80"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-muted/70 mt-1">
                      <span>Smaller size</span>
                      <span>Higher clarity</span>
                    </div>
                  </div>

                  {/* Output Format */}
                  <div>
                    <label htmlFor="inspector-output-format" className="block text-[12px] font-medium text-text mb-1.5">
                      Output Format
                    </label>
                    <select
                      id="inspector-output-format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value as "auto" | "webp" | "jpeg" | "png")}
                      className="w-full focus-ring rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text"
                    >
                      <option value="auto">Auto (Match input format)</option>
                      <option value="webp">WebP (Modern, highly recommended)</option>
                      <option value="jpeg">JPG / JPEG (Universal compatibility)</option>
                      <option value="png">PNG (Lossless)</option>
                    </select>
                  </div>

                  {/* Max Resolution Limit */}
                  <div>
                    <label htmlFor="inspector-max-resolution" className="block text-[12px] font-medium text-text mb-1.5">
                      Max Resolution Constraint
                    </label>
                    <select
                      id="inspector-max-resolution"
                      value={maxDimension}
                      onChange={(e) => setMaxDimension(Number(e.target.value))}
                      className="w-full focus-ring rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text"
                    >
                      <option value={0}>Original Dimensions (No downscaling)</option>
                      <option value={2560}>2560px Max (2K QHD)</option>
                      <option value={1920}>1920px Max (1080p Web Standard)</option>
                      <option value={1280}>1280px Max (720p HD)</option>
                    </select>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-3 border-t border-border/80">
                    <button
                      onClick={handleCompressAll}
                      disabled={isCompressing}
                      className="w-full h-10 rounded-md bg-accent font-sans text-[13px] font-medium text-white shadow-sm shadow-accent/20 hover:bg-accent-strong transition-all disabled:opacity-50"
                    >
                      {isCompressing ? "Compressing…" : `Compress Image${items.length > 1 ? "s" : ""}`}
                    </button>

                    <Dropzone
                      accept="image/*"
                      multiple
                      onFiles={handleAddFiles}
                      label="Add more files"
                      hint="Append to compression queue"
                      compact
                      className="mt-3"
                    />
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
