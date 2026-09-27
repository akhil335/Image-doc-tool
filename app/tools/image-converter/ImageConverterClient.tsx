"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import ProgressBar from "@/components/ProgressBar";
import Toast from "@/components/Toast";
import { formatBytes, calculateSavings, getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import { canvasToBlob, createCanvas } from "@/lib/canvasUtils";
import { saveAs } from "file-saver";
import JSZip from "jszip";

type TargetFormat = "png" | "jpeg" | "webp" | "avif" | "bmp";

interface ConvertedItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  convertedBlob: Blob | null;
  convertedSize: number | null;
  status: "idle" | "processing" | "done" | "error";
  errorMessage?: string;
  targetFormat: TargetFormat;
  quality: number;
}

const FORMAT_CONFIG: Record<
  TargetFormat,
  { label: string; mime: string; ext: string; hasQuality: boolean }
> = {
  webp: { label: "WebP (Modern)", mime: "image/webp", ext: "webp", hasQuality: true },
  png: { label: "PNG (Lossless)", mime: "image/png", ext: "png", hasQuality: false },
  jpeg: { label: "JPG / JPEG", mime: "image/jpeg", ext: "jpg", hasQuality: true },
  avif: { label: "AVIF (Ultra)", mime: "image/avif", ext: "avif", hasQuality: true },
  bmp: { label: "BMP (Bitmap)", mime: "image/bmp", ext: "bmp", hasQuality: false },
};

export default function ImageConverterClient() {
  const [items, setItems] = useState<ConvertedItem[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<TargetFormat>("webp");
  const [quality, setQuality] = useState<number>(85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/") || f.name.match(/\.(png|jpe?g|webp|avif|bmp|svg|gif)$/i));
    if (valid.length === 0) {
      setToastMsg("Please select valid image files.");
      return;
    }

    const newItems: ConvertedItem[] = valid.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      convertedBlob: null,
      convertedSize: null,
      status: "idle",
      targetFormat: selectedFormat,
      quality,
    }));

    setItems((prev) => [...prev, ...newItems]);
  }, [selectedFormat, quality]);

  function removeItem(id: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setOverallProgress(0);
  }

  async function convertSingle(item: ConvertedItem, fmt: TargetFormat, q: number): Promise<Blob> {
    const img = await loadImage(item.previewUrl);
    const { canvas, ctx } = createCanvas(img.naturalWidth, img.naturalHeight);

    if (fmt === "jpeg" || fmt === "bmp") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    const mime = FORMAT_CONFIG[fmt].mime;
    const blob = await canvasToBlob(canvas, mime, q / 100);
    return blob;
  }

  async function handleConvertAll() {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setOverallProgress(0);

    let completed = 0;
    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      setItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: "processing" } : it))
      );

      try {
        const blob = await convertSingle(item, selectedFormat, quality);
        updated[i] = {
          ...item,
          convertedBlob: blob,
          convertedSize: blob.size,
          status: "done",
          targetFormat: selectedFormat,
          quality,
        };
      } catch (err: unknown) {
        console.error("Conversion error:", err);
        updated[i] = {
          ...item,
          status: "error",
          errorMessage: err instanceof Error ? err.message : "Failed to convert",
        };
      }

      completed++;
      setOverallProgress(Math.round((completed / items.length) * 100));
      setItems([...updated]);
    }

    setIsProcessing(false);
    setToastMsg(`Converted ${completed} image${completed > 1 ? "s" : ""} successfully.`);
  }

  function downloadItem(item: ConvertedItem) {
    if (!item.convertedBlob) return;
    const baseName = getFileNameWithoutExtension(item.file.name);
    const ext = FORMAT_CONFIG[item.targetFormat].ext;
    saveAs(item.convertedBlob, `${baseName}.${ext}`);
  }

  async function downloadAllZip() {
    const readyItems = items.filter((i) => i.convertedBlob);
    if (readyItems.length === 0) return;

    const zip = new JSZip();
    readyItems.forEach((item) => {
      const baseName = getFileNameWithoutExtension(item.file.name);
      const ext = FORMAT_CONFIG[item.targetFormat].ext;
      zip.file(`${baseName}.${ext}`, item.convertedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `converted-${selectedFormat}.zip`);
    setToastMsg("Downloaded all as ZIP archive.");
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <ToolHeader
            tag="01"
            title="Image Converter"
            description="Convert images between PNG, JPG, WebP, AVIF, and BMP format with high-fidelity canvas processing. Batch ready."
            badge="Multi-format"
          />

          {items.length === 0 ? (
            <div className="max-w-2xl mx-auto mt-6 animate-fade-in">
              <Dropzone
                accept="image/*"
                multiple
                onFiles={handleAddFiles}
                label="Drop images to convert"
                hint="PNG, JPG, WebP, AVIF, BMP, GIF · Multiple files supported"
              />
            </div>
          ) : (
            <div className="mt-6 space-y-6 animate-fade-in">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-2">
                    <label htmlFor="conv-format-select" className="text-muted font-medium">Format:</label>
                    <select
                      id="conv-format-select"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value as TargetFormat)}
                      className="focus-ring rounded-md border border-border bg-bg px-3 py-1.5 font-sans font-medium text-text text-[13px]"
                    >
                      {Object.entries(FORMAT_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {FORMAT_CONFIG[selectedFormat].hasQuality && (
                    <div className="flex items-center gap-2">
                      <label htmlFor="conv-quality-range" className="text-muted font-medium">Quality:</label>
                      <input
                        id="conv-quality-range"
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="h-1.5 w-24 accent-accent cursor-pointer bg-bg border border-border"
                      />
                      <span className="font-mono text-[11px] text-accent font-semibold">{quality}%</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearAll}
                    disabled={isProcessing}
                    className="h-8 rounded-md px-3 text-[12px] font-medium text-muted hover:text-danger hover:bg-surface-hover transition-colors"
                  >
                    Clear all
                  </button>
                  {doneCount > 1 && (
                    <button
                      onClick={downloadAllZip}
                      className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-text hover:border-accent hover:text-accent transition-colors"
                    >
                      Download all (.zip)
                    </button>
                  )}
                  <button
                    onClick={handleConvertAll}
                    disabled={isProcessing}
                    className="h-8 rounded-md bg-accent px-4 text-[12px] font-medium text-white shadow-sm shadow-accent/20 hover:bg-accent-strong transition-all disabled:opacity-50"
                  >
                    {isProcessing ? "Converting…" : "Convert all files"}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <ProgressBar
                  progress={overallProgress}
                  label="Processing batch..."
                  subtext={`${overallProgress}%`}
                />
              )}

              {/* Queue List */}
              <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
                <div className="border-b border-border/80 px-4 py-3 flex items-center justify-between font-mono text-[11px] text-muted uppercase tracking-wider">
                  <span>Queue ({items.length})</span>
                  <span>{doneCount} of {items.length} converted</span>
                </div>

                <ul className="divide-y divide-border/60">
                  {items.map((item, idx) => {
                    const savings =
                      item.convertedSize !== null
                        ? calculateSavings(item.originalSize, item.convertedSize)
                        : null;

                    return (
                      <li
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-[11px] text-muted/60 w-5">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt=""
                            className="h-11 w-11 rounded-md object-cover border border-border shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] text-text font-medium">
                              {item.file.name}
                            </p>
                            <p className="font-mono text-[11px] text-muted">
                              {formatBytes(item.originalSize)}
                              {item.convertedSize !== null && (
                                <>
                                  {" "}→{" "}
                                  <span className="text-text font-semibold">
                                    {formatBytes(item.convertedSize)}
                                  </span>
                                  {savings && (
                                    <span
                                      className={`ml-2 px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                                        savings.isSmaller
                                          ? "bg-accent/10 text-accent"
                                          : "bg-muted/10 text-muted"
                                      }`}
                                    >
                                      {savings.isSmaller ? `-${savings.percentage}%` : `+${savings.percentage}%`}
                                    </span>
                                  )}
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {item.status === "processing" && (
                            <span className="font-mono text-[11px] text-accent animate-pulse">converting…</span>
                          )}
                          {item.status === "done" && item.convertedBlob && (
                            <button
                              onClick={() => downloadItem(item)}
                              className="h-7 rounded-md bg-accent/10 border border-accent/30 text-accent font-sans text-[11px] font-medium px-2.5 hover:bg-accent hover:text-white transition-colors"
                            >
                              Download .{FORMAT_CONFIG[item.targetFormat].ext}
                            </button>
                          )}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isProcessing}
                            className="h-7 w-7 flex items-center justify-center rounded text-muted hover:text-danger hover:bg-surface"
                            aria-label="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Add more dropzone */}
              <Dropzone
                accept="image/*"
                multiple
                onFiles={handleAddFiles}
                label="Add more images to convert"
                hint="Append to batch queue"
                compact
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
