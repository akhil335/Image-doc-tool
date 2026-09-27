"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import BeforeAfterPreview from "@/components/BeforeAfterPreview";
import { getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import { replaceBackgroundColor, canvasToBlob } from "@/lib/canvasUtils";
import { saveAs } from "file-saver";

export default function BackgroundClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [targetColor, setTargetColor] = useState<string>("#ffffff");
  const [tolerance, setTolerance] = useState<number>(25);
  const [mode, setMode] = useState<"transparent" | "color">("transparent");
  const [replacementColor, setReplacementColor] = useState<string>("#0284c7");
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"slider" | "eyedropper">("slider");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const sampleCanvasRef = useRef<HTMLCanvasElement>(null);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f || !f.type.startsWith("image/")) {
      setToastMsg("Please select a valid image.");
      return;
    }
    const url = URL.createObjectURL(f);
    setFile(f);
    setImgUrl(url);
    setProcessedUrl(null);
    setProcessedBlob(null);

    // Auto-sample top-left corner color
    try {
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const p = ctx.getImageData(0, 0, 1, 1).data;
        const hex = `#${p[0].toString(16).padStart(2, "0")}${p[1].toString(16).padStart(2, "0")}${p[2].toString(16).padStart(2, "0")}`;
        setTargetColor(hex);
      }
    } catch {
      // ignore
    }

    setToastMsg(`Loaded ${f.name}`);
  }

  const runColorKeying = useCallback(async () => {
    if (!imgUrl) return;
    setIsProcessing(true);
    try {
      const img = await loadImage(imgUrl);
      const canvas = replaceBackgroundColor(
        img,
        targetColor,
        tolerance,
        mode === "transparent" ? undefined : replacementColor
      );

      const blob = await canvasToBlob(canvas, "image/png");
      const url = URL.createObjectURL(blob);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      setProcessedBlob(blob);
      setProcessedUrl(url);
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to process background.");
    } finally {
      setIsProcessing(false);
    }
  }, [imgUrl, targetColor, tolerance, mode, replacementColor, processedUrl]);

  useEffect(() => {
    if (!imgUrl) return;
    const timer = setTimeout(() => {
      runColorKeying();
    }, 200);
    return () => clearTimeout(timer);
  }, [imgUrl, targetColor, tolerance, mode, replacementColor, runColorKeying]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = sampleCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1].toString(16).padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;
    setTargetColor(hex);
    setToastMsg(`Sampled background color: ${hex}`);
  }

  useEffect(() => {
    if (!imgUrl || !sampleCanvasRef.current) return;
    loadImage(imgUrl).then((img) => {
      const canvas = sampleCanvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
    });
  }, [imgUrl]);

  function handleDownload() {
    if (!processedBlob || !file) return;
    const baseName = getFileNameWithoutExtension(file.name);
    saveAs(processedBlob, `${baseName}-bg-removed.png`);
    setToastMsg("Downloaded transparent PNG.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="11 · Isolate"
            title="Background Removal"
            description="Isolate foreground subjects and key out solid or semi-uniform backgrounds directly in your browser. Fine-tune delta tolerance and sample pixel colors using the interactive eyedropper."
            badge="Studio Keyer"
          />

          {!file ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/*"
                multiple={false}
                onFiles={handleFile}
                label="Drop an image to isolate background, or click to browse"
                hint="PNG · JPG · WebP · AVIF · Works best with solid studio backgrounds or graphics"
              />
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Viewport Stage with Before/After or Eyedropper (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                    {/* Viewport Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-surface/50 text-[12px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        <span className="font-mono text-[11px] text-muted truncate max-w-[140px] xs:max-w-[200px]">
                          {file.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-md border border-border p-0.5 bg-bg overflow-x-auto scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setViewMode("slider")}
                          className={`px-2.5 py-0.5 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                            viewMode === "slider"
                              ? "bg-accent text-white"
                              : "text-muted hover:text-text"
                          }`}
                        >
                          Comparison Slider
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("eyedropper")}
                          className={`px-2.5 py-0.5 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                            viewMode === "eyedropper"
                              ? "bg-accent text-white"
                              : "text-muted hover:text-text"
                          }`}
                        >
                          Eyedropper Canvas
                        </button>
                      </div>
                    </div>

                    {/* Viewport Body */}
                    <div className="relative min-h-[420px] bg-black/40 p-4 flex items-center justify-center pattern-dots">
                      {viewMode === "slider" ? (
                        processedUrl ? (
                          <div className="w-full">
                            <BeforeAfterPreview
                              beforeUrl={imgUrl}
                              afterUrl={processedUrl}
                              beforeLabel="Original"
                              afterLabel="Keyed Result"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted font-mono text-[12px]">
                            <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                            <span>Processing chroma isolation…</span>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-[11px] font-mono text-muted text-center">
                            Click anywhere on the image below to sample the background color:
                          </p>
                          <canvas
                            ref={sampleCanvasRef}
                            onClick={handleCanvasClick}
                            className="max-h-[380px] max-w-full cursor-crosshair rounded border border-border/80 shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Keyer Inspector Controls (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M12.83 2.17a2.5 2.5 0 0 1 3.536 3.536l-9.193 9.192a2.5 2.5 0 0 1-1.414.717l-3.536.59a.75.75 0 0 1-.86-.86l.59-3.535a2.5 2.5 0 0 1 .717-1.414l9.193-9.193Zm2.475 1.06a1 1 0 0 0-1.414 0l-.828.829 2.475 2.475.828-.829a1 1 0 0 0 0-1.414l-1.06-1.06Zm-2.889 2.89L9.94 3.645 2.868 10.718a1 1 0 0 0-.287.566l-.423 2.54 2.54-.424a1 1 0 0 0 .566-.286l7.073-7.073Z"/>
                        </svg>
                        <h3 className="text-[13px] font-semibold text-text">Keying Inspector</h3>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setImgUrl("");
                        }}
                        className="text-[11px] font-mono text-muted hover:text-red-400 transition-colors"
                      >
                        Change Image
                      </button>
                    </div>

                    {/* Target Key Color */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">Target Background Color</label>
                      <div className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-border bg-bg">
                        <input
                          type="color"
                          value={targetColor}
                          onChange={(e) => setTargetColor(e.target.value)}
                          className="h-5 w-5 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[12px] text-text font-semibold">{targetColor.toUpperCase()}</span>
                        <button
                          type="button"
                          onClick={() => setViewMode("eyedropper")}
                          className="ml-auto text-[11px] text-accent hover:underline font-mono"
                        >
                          Eyedropper
                        </button>
                      </div>
                    </div>

                    {/* Tolerance Slider */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                        <span className="text-muted">Color Delta Tolerance</span>
                        <span className="text-accent font-semibold">{tolerance}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="80"
                        value={tolerance}
                        onChange={(e) => setTolerance(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full bg-border accent-accent cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-muted/60 mt-1">
                        <span>Strict (1)</span>
                        <span>Balanced (25)</span>
                        <span>Aggressive (80)</span>
                      </div>
                    </div>

                    {/* Replacement Mode */}
                    <div className="pt-2 border-t border-border">
                      <span className="block text-[11px] font-mono text-muted mb-2">Replacement Channel</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMode("transparent")}
                          className={`h-8 rounded-lg border text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 ${
                            mode === "transparent"
                              ? "border-accent bg-accent/10 text-accent font-semibold"
                              : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                          }`}
                        >
                          <span>▦</span> Transparent (Alpha)
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode("color")}
                          className={`h-8 rounded-lg border text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 ${
                            mode === "color"
                              ? "border-accent bg-accent/10 text-accent font-semibold"
                              : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                          }`}
                        >
                          <span>■</span> Solid Color
                        </button>
                      </div>

                      {mode === "color" && (
                        <div className="mt-3">
                          <label className="block text-[11px] font-mono text-muted mb-1.5">New Background Fill</label>
                          <div className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-border bg-bg">
                            <input
                              type="color"
                              value={replacementColor}
                              onChange={(e) => setReplacementColor(e.target.value)}
                              className="h-5 w-5 rounded border-0 bg-transparent cursor-pointer"
                            />
                            <span className="font-mono text-[12px] text-text font-semibold">{replacementColor.toUpperCase()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Download Execution */}
                    <div className="pt-3 border-t border-border">
                      <button
                        onClick={handleDownload}
                        disabled={isProcessing || !processedBlob}
                        className="w-full h-10 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        {isProcessing ? "Processing…" : "Download Isolated PNG"}
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
