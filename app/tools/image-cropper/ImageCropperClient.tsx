"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import { canvasToBlob, createCanvas } from "@/lib/canvasUtils";
import { saveAs } from "file-saver";

type AspectRatioMode = "free" | "1:1" | "4:3" | "16:9" | "9:16" | "3:2";

export default function ImageCropperClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [naturalDimensions, setNaturalDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [ratioMode, setRatioMode] = useState<AspectRatioMode>("free");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Normalized crop rectangle: 0 to 1 relative to displayed image container
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0.1,
    y: 0.1,
    w: 0.8,
    h: 0.8,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragMode = useRef<"move" | "nw" | "ne" | "se" | "sw" | null>(null);
  const dragStart = useRef<{ clientX: number; clientY: number; crop: typeof crop }>({
    clientX: 0,
    clientY: 0,
    crop: { x: 0, y: 0, w: 0, h: 0 },
  });

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
      setNaturalDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
      setZoom(1);
      setRotation(0);
      setToastMsg(`Loaded ${f.name}`);
    } catch {
      setToastMsg("Could not load image.");
    }
  }

  const applyRatio = useCallback((mode: AspectRatioMode) => {
    setRatioMode(mode);
    if (mode === "free") return;

    let targetRatio = 1;
    if (mode === "1:1") targetRatio = 1;
    else if (mode === "4:3") targetRatio = 4 / 3;
    else if (mode === "16:9") targetRatio = 16 / 9;
    else if (mode === "9:16") targetRatio = 9 / 16;
    else if (mode === "3:2") targetRatio = 3 / 2;

    setCrop((prev) => {
      let newW = prev.w;
      let newH = prev.w / targetRatio;
      if (newH > 0.9) {
        newH = 0.9;
        newW = newH * targetRatio;
      }
      return {
        x: Math.max(0, Math.min(1 - newW, prev.x)),
        y: Math.max(0, Math.min(1 - newH, prev.y)),
        w: newW,
        h: newH,
      };
    });
  }, []);

  const handlePointerDown = (
    mode: "move" | "nw" | "ne" | "se" | "sw",
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragMode.current = mode;
    dragStart.current = {
      clientX,
      clientY,
      crop: { ...crop },
    };
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragMode.current || !containerRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = (clientX - dragStart.current.clientX) / rect.width;
    const dy = (clientY - dragStart.current.clientY) / rect.height;

    const start = dragStart.current.crop;

    if (dragMode.current === "move") {
      const newX = Math.max(0, Math.min(1 - start.w, start.x + dx));
      const newY = Math.max(0, Math.min(1 - start.h, start.y + dy));
      setCrop({ ...start, x: newX, y: newY });
    } else if (dragMode.current === "se") {
      let newW = Math.max(0.08, Math.min(1 - start.x, start.w + dx));
      let newH = Math.max(0.08, Math.min(1 - start.y, start.h + dy));
      if (ratioMode !== "free") {
        const ratio = ratioMode === "1:1" ? 1 : ratioMode === "4:3" ? 4 / 3 : ratioMode === "16:9" ? 16 / 9 : ratioMode === "9:16" ? 9 / 16 : 3 / 2;
        newH = newW / ratio;
      }
      setCrop({ ...start, w: newW, h: newH });
    } else if (dragMode.current === "nw") {
      const newW = Math.max(0.08, start.w - dx);
      const newH = Math.max(0.08, start.h - dy);
      const newX = Math.max(0, start.x + dx);
      const newY = Math.max(0, start.y + dy);
      setCrop({ x: newX, y: newY, w: newW, h: newH });
    }
  }, [ratioMode]);

  const handlePointerUp = useCallback(() => {
    dragMode.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  async function handleExportCrop() {
    if (!imgUrl || !naturalDimensions.w) return;
    setIsExporting(true);

    try {
      const img = await loadImage(imgUrl);

      const intermediateW = img.naturalWidth * zoom;
      const intermediateH = img.naturalHeight * zoom;
      const { canvas: interCanvas, ctx: interCtx } = createCanvas(intermediateW, intermediateH);

      interCtx.translate(intermediateW / 2, intermediateH / 2);
      interCtx.rotate((rotation * Math.PI) / 180);
      interCtx.drawImage(img, -intermediateW / 2, -intermediateH / 2, intermediateW, intermediateH);

      const cropPxX = Math.round(crop.x * interCanvas.width);
      const cropPxY = Math.round(crop.y * interCanvas.height);
      const cropPxW = Math.max(1, Math.round(crop.w * interCanvas.width));
      const cropPxH = Math.max(1, Math.round(crop.h * interCanvas.height));

      const { canvas: outCanvas, ctx: outCtx } = createCanvas(cropPxW, cropPxH);
      if (exportFormat === "image/jpeg") {
        outCtx.fillStyle = "#ffffff";
        outCtx.fillRect(0, 0, cropPxW, cropPxH);
      }

      outCtx.drawImage(
        interCanvas,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        0,
        0,
        cropPxW,
        cropPxH
      );

      const blob = await canvasToBlob(outCanvas, exportFormat, 0.95);
      const baseName = file ? getFileNameWithoutExtension(file.name) : "cropped";
      const ext = exportFormat === "image/png" ? "png" : exportFormat === "image/jpeg" ? "jpg" : "webp";
      saveAs(blob, `${baseName}-cropped-${cropPxW}x${cropPxH}.${ext}`);
      setToastMsg(`Exported cropped image (${cropPxW} × ${cropPxH} px)`);
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to export cropped image.");
    } finally {
      setIsExporting(false);
    }
  }

  const outputWidthPx = Math.round(crop.w * naturalDimensions.w * zoom);
  const outputHeightPx = Math.round(crop.h * naturalDimensions.h * zoom);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="05 · Crop"
            title="Image Cropper"
            description="Precision image framing with interactive drag handles, aspect ratio constraints (1:1, 16:9, 4:3, 9:16), rule-of-thirds composition grid, and continuous rotation."
            badge="Studio Crop"
          />

          {!file ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/*"
                multiple={false}
                onFiles={handleFile}
                label="Drop an image to crop, or click to browse"
                hint="PNG · JPG · WebP · AVIF · Single image"
              />
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Interactive Crop Viewport (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                    {/* Viewport Header */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-surface/50 text-[12px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        <span className="font-mono text-[11px] text-muted truncate max-w-[140px] xs:max-w-[200px]">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="font-mono text-[11px] text-muted">
                          <span className="hidden xs:inline">Orig: </span>{naturalDimensions.w} × {naturalDimensions.h} px
                        </span>
                        <button
                          onClick={() => {
                            setFile(null);
                            setImgUrl("");
                          }}
                          className="text-[11px] font-mono text-muted hover:text-red-400 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Crop Canvas Display Area */}
                    <div className="relative flex h-[340px] sm:h-[420px] md:h-[480px] w-full items-center justify-center overflow-hidden bg-black/80 select-none">
                      <div
                        ref={containerRef}
                        className="relative h-full w-full flex items-center justify-center overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt="To crop"
                          className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-75"
                          style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                          }}
                        />

                        {/* Darkened overlay outside crop */}
                        <div
                          className="absolute border-2 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move touch-none"
                          style={{
                            left: `${crop.x * 100}%`,
                            top: `${crop.y * 100}%`,
                            width: `${crop.w * 100}%`,
                            height: `${crop.h * 100}%`,
                          }}
                          onMouseDown={(e) => handlePointerDown("move", e)}
                          onTouchStart={(e) => handlePointerDown("move", e)}
                        >
                          {/* Rule of thirds grid lines */}
                          {showGrid && (
                            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                              <div className="border-r border-b border-white/25" />
                              <div className="border-r border-b border-white/25" />
                              <div className="border-b border-white/25" />
                              <div className="border-r border-b border-white/25" />
                              <div className="border-r border-b border-white/25" />
                              <div className="border-b border-white/25" />
                              <div className="border-r border-b border-white/25" />
                              <div className="border-r border-b border-white/25" />
                              <div />
                            </div>
                          )}

                          {/* Corner resize handle: SE */}
                          <div
                            className="absolute -bottom-3 -right-3 h-6 w-6 sm:h-5 sm:w-5 rounded-full bg-accent border-2 border-white cursor-se-resize shadow-md touch-none"
                            onMouseDown={(e) => handlePointerDown("se", e)}
                            onTouchStart={(e) => handlePointerDown("se", e)}
                          />

                          {/* Corner resize handle: NW */}
                          <div
                            className="absolute -top-3 -left-3 h-6 w-6 sm:h-5 sm:w-5 rounded-full bg-accent border-2 border-white cursor-nw-resize shadow-md touch-none"
                            onMouseDown={(e) => handlePointerDown("nw", e)}
                            onTouchStart={(e) => handlePointerDown("nw", e)}
                          />

                          {/* Output Dimension Badge */}
                          <div className="absolute top-2 left-2 rounded-md bg-black/80 px-2 py-0.5 font-mono text-[10px] text-white pointer-events-none backdrop-blur-xs">
                            {outputWidthPx} × {outputHeightPx} px
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Inspector Settings (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3.5 1.75a.75.75 0 0 0-1.5 0v1.5H.75a.75.75 0 0 0 0 1.5h1.25V12a2 2 0 0 0 2 2h7.25v1.25a.75.75 0 0 0 1.5 0V14h1.25a.75.75 0 0 0 0-1.5H12.5V4a2 2 0 0 0-2-2H4V.75a.75.75 0 0 0-.5-.75ZM4 3.5h6.5a.5.5 0 0 1 .5.5V11H4a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z"/>
                        </svg>
                        <h3 className="text-[13px] font-semibold text-text">Crop & Framing</h3>
                      </div>
                      <span className="font-mono text-[11px] text-accent">
                        {outputWidthPx} × {outputHeightPx}
                      </span>
                    </div>

                    {/* Aspect Ratio Buttons */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">Aspect Ratio Mode</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "free", label: "Freeform" },
                          { id: "1:1", label: "1:1 Square" },
                          { id: "4:3", label: "4:3 Photo" },
                          { id: "16:9", label: "16:9 Wide" },
                          { id: "9:16", label: "9:16 Story" },
                          { id: "3:2", label: "3:2 DSLR" },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => applyRatio(r.id as AspectRatioMode)}
                            className={`h-8 rounded-lg border px-2 text-[11px] font-mono transition-all ${
                              ratioMode === r.id
                                ? "border-accent bg-accent/10 text-accent font-semibold"
                                : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grid Overlay Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-muted hover:text-text">
                        <input
                          type="checkbox"
                          checked={showGrid}
                          onChange={(e) => setShowGrid(e.target.checked)}
                          className="accent-accent h-3.5 w-3.5 rounded"
                        />
                        <span>Rule of thirds grid</span>
                      </label>
                      <span className="font-mono text-[11px] text-muted/60">3 × 3 matrix</span>
                    </div>

                    {/* Zoom & Rotation Controls */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-muted">Zoom Level</span>
                        <span className="text-accent font-semibold">{zoom.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full bg-border accent-accent cursor-pointer"
                      />

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] font-mono text-muted">Rotate ({rotation}°)</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRotation((r) => (r - 90) % 360)}
                            className="h-7 px-2.5 rounded-md border border-border bg-bg text-muted hover:text-text hover:border-accent text-[11px] font-mono transition-colors"
                            title="Rotate 90 CCW"
                          >
                            ↺ -90°
                          </button>
                          <button
                            type="button"
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                            className="h-7 px-2.5 rounded-md border border-border bg-bg text-muted hover:text-text hover:border-accent text-[11px] font-mono transition-colors"
                            title="Rotate 90 CW"
                          >
                            ↻ +90°
                          </button>
                        </div>
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
                        <option value="image/png">PNG · Lossless</option>
                        <option value="image/jpeg">JPG · Web standard</option>
                        <option value="image/webp">WebP · High efficiency</option>
                      </select>
                    </div>

                    {/* Export Action */}
                    <div className="pt-3 border-t border-border">
                      <button
                        onClick={handleExportCrop}
                        disabled={isExporting}
                        className="w-full h-10 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        {isExporting ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Exporting crop…</span>
                          </>
                        ) : (
                          <>
                            <span>Crop & Export</span>
                            <span className="text-[11px] font-mono opacity-80">({outputWidthPx} × {outputHeightPx})</span>
                          </>
                        )}
                      </button>
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
