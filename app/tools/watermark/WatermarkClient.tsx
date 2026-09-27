"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import { applyWatermark, canvasToBlob, WatermarkOptions } from "@/lib/canvasUtils";
import { saveAs } from "file-saver";
import JSZip from "jszip";

interface WatermarkItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function WatermarkClient() {
  const [items, setItems] = useState<WatermarkItem[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");

  // Text watermark options
  const [wmText, setWmText] = useState<string>("© DocForge");
  const [wmFont, setWmFont] = useState<string>("sans-serif");
  const [wmFontSize, setWmFontSize] = useState<number>(36);
  const [wmColor, setWmColor] = useState<string>("#ffffff");

  // Logo watermark options
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoScale, setLogoScale] = useState<number>(0.25);

  // Common options
  const [opacity, setOpacity] = useState<number>(0.75);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<WatermarkOptions["position"]>("bottom-right");
  const [exportFormat, setExportFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/jpeg");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  function handleAddFiles(files: File[]) {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (!valid.length) {
      setToastMsg("Please select valid image files.");
      return;
    }
    const loaded = valid.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setItems((prev) => [...prev, ...loaded]);
    setToastMsg(`Loaded ${loaded.length} image${loaded.length > 1 ? "s" : ""}.`);
  }

  async function handleLogoUpload(files: File[]) {
    const f = files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    try {
      const img = await loadImage(url);
      setLogoImg(img);
      setToastMsg(`Loaded watermark logo: ${f.name}`);
    } catch {
      setToastMsg("Could not load logo image.");
    }
  }

  const activeItem = items[activeIdx] || items[0];

  useEffect(() => {
    let active = true;
    async function updatePreview() {
      if (!activeItem || !canvasRef.current) return;
      try {
        const img = await loadImage(activeItem.previewUrl);
        if (!active) return;

        const options: WatermarkOptions = {
          type: watermarkType,
          text: wmText,
          fontFamily: wmFont,
          fontSize: wmFontSize,
          textColor: wmColor,
          watermarkImage: logoImg || undefined,
          scale: logoScale,
          opacity,
          rotation,
          position,
        };

        const resultCanvas = applyWatermark(img, options);
        if (!active || !canvasRef.current) return;

        const previewCanvas = canvasRef.current;
        previewCanvas.width = resultCanvas.width;
        previewCanvas.height = resultCanvas.height;
        const ctx = previewCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(resultCanvas, 0, 0);
        }
      } catch (err) {
        console.error(err);
      }
    }

    updatePreview();
    return () => {
      active = false;
    };
  }, [
    activeItem,
    watermarkType,
    wmText,
    wmFont,
    wmFontSize,
    wmColor,
    logoImg,
    logoScale,
    opacity,
    rotation,
    position,
  ]);

  async function processItem(item: WatermarkItem): Promise<Blob> {
    const img = await loadImage(item.previewUrl);
    const options: WatermarkOptions = {
      type: watermarkType,
      text: wmText,
      fontFamily: wmFont,
      fontSize: wmFontSize,
      textColor: wmColor,
      watermarkImage: logoImg || undefined,
      scale: logoScale,
      opacity,
      rotation,
      position,
    };

    const canvas = applyWatermark(img, options);
    return await canvasToBlob(canvas, exportFormat, 0.95);
  }

  async function handleDownloadActive() {
    if (!activeItem) return;
    setIsProcessing(true);
    try {
      const blob = await processItem(activeItem);
      const baseName = getFileNameWithoutExtension(activeItem.file.name);
      const ext = exportFormat === "image/png" ? "png" : exportFormat === "image/jpeg" ? "jpg" : "webp";
      saveAs(blob, `${baseName}-watermarked.${ext}`);
      setToastMsg("Downloaded watermarked image.");
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to watermark image.");
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
        const blob = await processItem(it);
        const baseName = getFileNameWithoutExtension(it.file.name);
        const ext = exportFormat === "image/png" ? "png" : exportFormat === "image/jpeg" ? "jpg" : "webp";
        zip.file(`${baseName}-watermarked.${ext}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "docforge-watermarked-images.zip");
      setToastMsg("Downloaded all as ZIP archive.");
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to bundle ZIP archive.");
    } finally {
      setIsProcessing(false);
    }
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

  const POSITIONS: { id: WatermarkOptions["position"]; label: string }[] = [
    { id: "top-left", label: "TL" },
    { id: "top-center", label: "TC" },
    { id: "top-right", label: "TR" },
    { id: "middle-left", label: "ML" },
    { id: "center", label: "C" },
    { id: "middle-right", label: "MR" },
    { id: "bottom-left", label: "BL" },
    { id: "bottom-center", label: "BC" },
    { id: "bottom-right", label: "BR" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="10 · Protect"
            title="Image Watermark"
            description="Protect your creative assets with custom text or logo watermarks. Fine-tune opacity, rotation, and 9-point anchor positioning with real-time canvas rendering."
            badge="Studio Watermark"
          />

          {items.length === 0 ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/*"
                multiple
                onFiles={handleAddFiles}
                label="Drop images to watermark, or click to browse"
                hint="PNG · JPG · WebP · AVIF · Single or batch files"
              />
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Live Watermarked Canvas Viewport (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                    {/* Viewport Header */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-surface/50 text-[12px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        <span className="font-mono text-[11px] text-muted truncate max-w-[140px] xs:max-w-[200px]">
                          {activeItem?.file.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-accent">
                        Live Preview
                      </span>
                    </div>

                    {/* Canvas Stage */}
                    <div className="relative flex min-h-[380px] max-h-[480px] items-center justify-center bg-black/50 p-4 overflow-hidden pattern-dots">
                      <canvas
                        ref={canvasRef}
                        className="max-h-[360px] max-w-full object-contain rounded shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Filmstrip queue */}
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
                              className="h-7 w-7 rounded object-cover border border-border/40"
                            />
                            <div className="min-w-0 pr-4">
                              <p className="truncate text-[11px] font-medium text-text max-w-[90px]">
                                {it.file.name}
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

                {/* Right: Watermark Inspector Controls (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M7.5 1.5a.75.75 0 0 0-1.5 0v3.75H2.25a.75.75 0 0 0 0 1.5H6V10.5H2.25a.75.75 0 0 0 0 1.5H6v2.5a.75.75 0 0 0 1.5 0V12h4.5v2.5a.75.75 0 0 0 1.5 0V12h3.75a.75.75 0 0 0 0-1.5H13.5V6.75h3.75a.75.75 0 0 0 0-1.5H13.5V1.5a.75.75 0 0 0-1.5 0v3.75H7.5V1.5Zm0 5.25h4.5v3.75H7.5V6.75Z"/>
                        </svg>
                        <h3 className="text-[13px] font-semibold text-text">Watermark Style</h3>
                      </div>
                      <div className="flex rounded-md border border-border p-0.5 bg-bg">
                        <button
                          type="button"
                          onClick={() => setWatermarkType("text")}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                            watermarkType === "text"
                              ? "bg-accent text-white"
                              : "text-muted hover:text-text"
                          }`}
                        >
                          Text
                        </button>
                        <button
                          type="button"
                          onClick={() => setWatermarkType("image")}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                            watermarkType === "image"
                              ? "bg-accent text-white"
                              : "text-muted hover:text-text"
                          }`}
                        >
                          Logo
                        </button>
                      </div>
                    </div>

                    {/* Text Settings */}
                    {watermarkType === "text" ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-mono text-muted mb-1">Watermark Text</label>
                          <input
                            type="text"
                            value={wmText}
                            onChange={(e) => setWmText(e.target.value)}
                            placeholder="e.g. © 2026 Studio"
                            className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[13px] text-text focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-muted mb-1">Font Family</label>
                            <select
                              value={wmFont}
                              onChange={(e) => setWmFont(e.target.value)}
                              className="w-full h-9 rounded-lg border border-border bg-bg px-2.5 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                            >
                              <option value="sans-serif">Modern Sans</option>
                              <option value="serif">Classic Serif</option>
                              <option value="monospace">Tech Mono</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-muted mb-1">Text Color</label>
                            <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg border border-border bg-bg">
                              <input
                                type="color"
                                value={wmColor}
                                onChange={(e) => setWmColor(e.target.value)}
                                className="h-5 w-5 rounded border-0 bg-transparent cursor-pointer"
                              />
                              <span className="font-mono text-[11px] text-text">{wmColor.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                            <span className="text-muted">Font Size</span>
                            <span className="text-accent">{wmFontSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="12"
                            max="120"
                            value={wmFontSize}
                            onChange={(e) => setWmFontSize(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full bg-border accent-accent cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-mono text-muted mb-1.5">Watermark Logo Image</label>
                          <input
                            type="file"
                            accept="image/png,image/svg+xml,image/webp"
                            onChange={(e) => {
                              if (e.target.files) handleLogoUpload(Array.from(e.target.files));
                            }}
                            className="w-full text-[12px] text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-mono file:bg-accent/10 file:text-accent hover:file:bg-accent hover:file:text-white file:transition-colors"
                          />
                        </div>
                        {logoImg && (
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-muted">Logo Scale</span>
                              <span className="text-accent">{Math.round(logoScale * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.05"
                              max="1"
                              step="0.05"
                              value={logoScale}
                              onChange={(e) => setLogoScale(Number(e.target.value))}
                              className="w-full h-1.5 rounded-full bg-border accent-accent cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 9-Point Anchor Position Matrix */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-muted">Anchor Position</span>
                        <span className="text-[11px] font-mono text-accent capitalize">{position}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto">
                        {POSITIONS.map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => setPosition(pos.id)}
                            className={`h-8 rounded-md border text-[10px] font-mono font-bold transition-all ${
                              position === pos.id
                                ? "border-accent bg-accent text-white"
                                : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity & Rotation Sliders */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-muted">Opacity</span>
                          <span className="text-accent">{Math.round(opacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={opacity}
                          onChange={(e) => setOpacity(Number(e.target.value))}
                          className="w-full h-1.5 rounded-full bg-border accent-accent cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-muted">Rotation</span>
                          <span className="text-accent">{rotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          step="5"
                          value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="w-full h-1.5 rounded-full bg-border accent-accent cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Export Format */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">Export Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as "image/png" | "image/jpeg" | "image/webp")}
                        className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="image/jpeg">JPG · Web standard</option>
                        <option value="image/png">PNG · Lossless</option>
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
                        {isProcessing ? "Processing…" : `Download Watermarked (${items.length > 1 ? "Selected" : "Image"})`}
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
