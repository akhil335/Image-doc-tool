"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import BeforeAfterPreview from "@/components/BeforeAfterPreview";

// Categories for the Tool Dock
type Category = "all" | "convert" | "edit" | "vector" | "security";

const FORMAT_STATS: Record<string, { size: string; saved: string }> = {
  WEBP: { size: "810 KB", saved: "-81%" },
  AVIF: { size: "590 KB", saved: "-86%" },
  PNG: { size: "2.1 MB", saved: "-50%" },
  JPG: { size: "940 KB", saved: "-78%" },
};

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [heroFiles, setHeroFiles] = useState<File[]>([]);
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  const [heroFormat, setHeroFormat] = useState<"WEBP" | "AVIF" | "PNG" | "JPG">("WEBP");
  const [sliderPosition, setSliderPosition] = useState(54);

  // Sample demo image for instant live workspace interaction
  const DEMO_ORIGINAL = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=95&auto=format&fit=crop";
  const DEMO_COMPRESSED = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=50&auto=format&fit=crop";

  function handleHeroDrop(files: File[]) {
    if (!files.length) return;
    setHeroFiles(files);
    const url = URL.createObjectURL(files[0]);
    setHeroPreviewUrl(url);
  }

  function handleLoadSample() {
    setHeroPreviewUrl(DEMO_ORIGINAL);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text bg-studio-grid">
      <Header />

      <main className="flex-1">
        {/* ===================================================================
            SECTION 1: THE LABORATORY HERO
            Asymmetric, bold display typography + interactive studio workbench
        =================================================================== */}
        <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden border-b border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Confident Typography & Proposition (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Laboratory Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-subtle px-3 py-1 font-mono text-[11px] font-semibold text-accent shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span>IMAGE LABORATORY · 100% IN-BROWSER</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-display font-black tracking-tighter text-4xl sm:text-5xl lg:text-6xl text-text leading-[0.95]">
                  IMAGE
                  <br />
                  <span className="text-accent underline decoration-accent/30 decoration-wavy underline-offset-4">
                    TOOLS.
                  </span>
                  <br />
                  WITHOUT
                  <br />
                  BUSYWORK.
                </h1>

                {/* Subtitle */}
                <p className="text-[15px] sm:text-[16px] text-muted leading-relaxed max-w-md font-sans">
                  The client-side image workbench engineered for speed. Convert, compress, resize, and vectorize directly on your CPU/GPU.
                  <span className="text-text font-medium"> Zero uploads, zero queues, zero privacy leaks.</span>
                </p>

                {/* Key Technical Badges */}
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                  <span className="rounded-md border border-border bg-surface px-2.5 py-1 text-muted shadow-xs">
                    ⚡ 0ms upload latency
                  </span>
                  <span className="rounded-md border border-border bg-surface px-2.5 py-1 text-muted shadow-xs">
                    🔒 WebAssembly sandbox
                  </span>
                  <span className="rounded-md border border-border bg-surface px-2.5 py-1 text-muted shadow-xs">
                    📦 Multi-file batching
                  </span>
                </div>

                {/* Fast Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#tools-directory"
                    className="h-10 px-5 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong transition-all flex items-center gap-2 shadow-xs"
                  >
                    <span>Launch Tools</span>
                    <span className="font-mono text-[11px] opacity-80">↓</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="h-10 px-4 rounded-lg border border-border bg-surface hover:border-accent hover:text-accent text-[13px] font-medium text-text transition-colors shadow-xs"
                  >
                    Load Sample Photo
                  </button>
                </div>
              </div>

              {/* Right Column: The Interactive Creative Workspace / Stage (7 cols) */}
              <div className="lg:col-span-7 relative">
                {/* Ambient Breathing Studio Glow */}
                <div className="absolute -inset-2 rounded-3xl bg-accent/20 blur-2xl animate-glow-breathe pointer-events-none" />

                <div className="relative rounded-2xl border-2 border-border bg-surface shadow-card overflow-hidden">
                  {/* Workspace Window Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border bg-surface-muted/60 text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <div className="hidden xs:flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-border-subtle border border-border" />
                        <div className="h-2.5 w-2.5 rounded-full bg-border-subtle border border-border" />
                        <div className="h-2.5 w-2.5 rounded-full bg-border-subtle border border-border" />
                      </div>
                      <span className="text-muted/60 hidden xs:inline">|</span>
                      <span className="text-text font-medium flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                        canvas_studio.wasm
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted hidden xs:inline">Target:</span>
                      <div className="flex rounded border border-border/80 p-0.5 bg-bg">
                        {(["WEBP", "AVIF", "PNG", "JPG"] as const).map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setHeroFormat(fmt)}
                            className={`px-1.5 py-0.5 text-[10px] rounded transition-all ${
                              heroFormat === fmt
                                ? "bg-accent text-white font-bold scale-105 shadow-xs"
                                : "text-muted hover:text-text"
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Workbench Canvas Area */}
                  <div className="relative min-h-[380px] p-3 sm:p-4 flex flex-col justify-between bg-checkerboard">
                    {/* Transformation Visual Badge (JPG -> WEBP · -81%) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 z-10">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-lg border border-border/80 bg-surface/95 px-2.5 sm:px-3 py-1 sm:py-1.5 backdrop-blur-sm shadow-xs font-mono text-[10px] sm:text-[11px] max-w-full transition-all">
                        <span className="text-muted hidden xs:inline">RAW/</span><span className="text-muted">JPEG</span>
                        <span className="text-muted font-bold">4.2 MB</span>
                        <span className="text-accent font-bold">→</span>
                        <span className="text-text font-semibold">{heroFormat}</span>
                        <span className="text-emerald-500 font-bold transition-all">
                          {FORMAT_STATS[heroFormat]?.size || "810 KB"}
                        </span>
                        <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 text-[9px] sm:text-[10px] transition-all">
                          {FORMAT_STATS[heroFormat]?.saved || "-81%"} SAVED
                        </span>
                      </div>

                      <span className="font-mono text-[10px] text-muted bg-surface/80 px-2 py-1 rounded border border-border/60 hidden sm:inline-block">
                        1920 × 1080 · 24-bit
                      </span>
                    </div>

                    {/* Stage Preview / Drop Center */}
                    {heroPreviewUrl ? (
                      <div className="relative my-4 flex items-center justify-center rounded-xl overflow-hidden border border-border shadow-inner max-h-[260px] bg-black/50 group">
                        {/* High-Tech Animated Laser Scan Line */}
                        <div className="animate-laser-scan" />

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroPreviewUrl}
                          alt="Loaded preview"
                          className="max-h-[250px] w-full object-contain"
                        />
                        <div className="absolute bottom-2 inset-x-2 flex flex-wrap sm:flex-nowrap justify-end gap-1.5 sm:gap-2">
                          <button
                            onClick={() => router.push("/tools/image-compressor")}
                            className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg bg-accent text-white font-mono text-[10px] sm:text-[11px] font-medium shadow-xs hover:bg-accent-strong transition-colors"
                          >
                            Compress in Studio ↗
                          </button>
                          <button
                            onClick={() => router.push("/tools/image-converter")}
                            className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg border border-border bg-surface text-text font-mono text-[10px] sm:text-[11px] hover:border-accent transition-colors"
                          >
                            Convert ↗
                          </button>
                          <button
                            onClick={() => {
                              setHeroPreviewUrl(null);
                              setHeroFiles([]);
                            }}
                            className="h-7 sm:h-8 px-2 rounded-lg border border-border bg-surface text-muted hover:text-red-400 font-mono text-[10px] sm:text-[11px]"
                            title="Reset"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative my-4 rounded-xl border border-dashed border-border/90 bg-surface/75 p-6 flex flex-col items-center justify-center text-center transition-all hover:border-accent hover:bg-surface">
                        {/* Stylized studio drag-drop area */}
                        <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>

                        <h3 className="font-display font-semibold text-[15px] text-text">
                          Drop image anywhere to inspect & transform
                        </h3>
                        <p className="font-mono text-[11px] text-muted mt-1">
                          PNG · JPG · WebP · SVG · AVIF · GIF
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                          <label className="h-8 px-3.5 rounded-lg bg-text text-bg hover:opacity-90 font-medium text-[11px] flex items-center cursor-pointer transition-opacity">
                            Browse Local File
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) handleHeroDrop(Array.from(e.target.files));
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleLoadSample}
                            className="h-8 px-3 rounded-lg border border-border bg-surface text-muted hover:text-text font-mono text-[11px] transition-colors"
                          >
                            Try Demo Sample
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Studio Bottom Quick Tool Jumps */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 font-mono text-[11px] z-10">
                      <span className="text-muted">Direct Laboratory Shortcuts:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href="/tools/image-compressor"
                          className="px-2 py-0.5 rounded border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                        >
                          Compress
                        </Link>
                        <Link
                          href="/tools/image-converter"
                          className="px-2 py-0.5 rounded border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                        >
                          Convert
                        </Link>
                        <Link
                          href="/tools/image-resizer"
                          className="px-2 py-0.5 rounded border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                        >
                          Resize
                        </Link>
                        <Link
                          href="/tools/svg-tools"
                          className="px-2 py-0.5 rounded border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                        >
                          Vectorize
                        </Link>
                        <Link
                          href="/tools/metadata"
                          className="px-2 py-0.5 rounded border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                        >
                          EXIF
                        </Link>
                        <Link
                          href="/tools/favicon-generator"
                          className="px-2 py-0.5 rounded border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                        >
                          Favicon
                        </Link>
                        <Link
                          href="/tools/svg-viewer"
                          className="px-2 py-0.5 rounded border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                        >
                          SVG Editor
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 2: TOOL DOCK & ASYMMETRIC EXPLORER
            Distinct visual hierarchy, varied card sizes, no boring identical grid
        =================================================================== */}
        <section id="tools-directory" className="py-16 sm:py-24 border-b border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
            {/* Section Header & Category Filter Dock */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-accent font-mono text-[11px] font-semibold tracking-wider uppercase mb-1">
                  <span>✦ 15 Native Tools</span>
                </div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-text tracking-tight">
                  Studio Tool Explorer
                </h2>
                <p className="text-muted text-[14px] mt-1 max-w-lg">
                  Every tool executes locally inside your browser sandbox with zero network transfer.
                </p>
              </div>

              {/* The Tactile Dock */}
              <div className="flex overflow-x-auto scrollbar-none sm:flex-wrap items-center gap-1.5 p-1 rounded-xl border border-border bg-surface shadow-xs max-w-full">
                {(
                  [
                    { id: "all", label: "All Utilities (15)" },
                    { id: "convert", label: "Convert & Compress" },
                    { id: "edit", label: "Crop, Resize & Frame" },
                    { id: "vector", label: "SVG & Code" },
                    { id: "security", label: "EXIF & Documents" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap shrink-0 ${
                      activeCategory === cat.id
                        ? "bg-accent text-white shadow-xs font-semibold"
                        : "text-muted hover:text-text hover:bg-surface-muted"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Asymmetric Studio Card Composition */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              {/* ==============================================================
                  HERO CARD 1: IMAGE COMPRESSOR (Col Span 7)
                  Features live interactive compression preview inside the card
              ============================================================== */}
              {(activeCategory === "all" || activeCategory === "convert") && (
                <div className="lg:col-span-7 rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs card-interactive flex flex-col justify-between relative overflow-hidden group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[13px] shadow-xs group-hover:scale-110 transition-transform">
                          K
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-text group-hover:text-accent transition-colors">
                            Image Compressor
                          </h3>
                          <span className="font-mono text-[10px] text-muted">Bicubic & WebP Engine</span>
                        </div>
                      </div>

                      <span className="font-mono text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Up to -85% Reduction
                      </span>
                    </div>

                    <p className="text-[13px] text-muted leading-relaxed">
                      High-impact compression for JPG, PNG, and WebP images. Compare visual clarity side-by-side using the interactive split slider before downloading.
                    </p>

                    {/* Mini Visual Simulation Element */}
                    <div className="rounded-xl border border-border bg-surface-muted/50 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-muted">Visual Quality: 75% Balanced</span>
                        <span className="text-accent font-semibold">3.8 MB → 640 KB</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-accent rounded-full w-3/4 animate-shimmer" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-6 mt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2 font-mono text-[11px] text-muted">
                      <span>PNG</span> · <span>JPG</span> · <span>WebP</span> · <span>AVIF</span>
                    </div>
                    <Link
                      href="/tools/image-compressor"
                      className="h-8 px-4 rounded-lg bg-accent text-white text-[12px] font-medium flex items-center gap-1.5 shadow-xs hover:bg-accent-strong transition-colors"
                    >
                      <span>Open Compressor</span>
                      <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  HERO CARD 2: SVG STUDIO & VECTORIZER (Col Span 5)
                  Features real SVG path tracing & markup optimizer
              ============================================================== */}
              {(activeCategory === "all" || activeCategory === "vector") && (
                <div className="lg:col-span-5 rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs card-interactive flex flex-col justify-between relative overflow-hidden group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[13px] shadow-xs">
                          S
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-text group-hover:text-accent transition-colors">
                            SVG Studio & Tracing
                          </h3>
                          <span className="font-mono text-[10px] text-muted">Potrace & SVGO</span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-accent border border-accent/30 bg-accent/10 px-2 py-0.5 rounded">
                        Vector Engine
                      </span>
                    </div>

                    <p className="text-[13px] text-muted leading-relaxed">
                      Render scalable SVGs into ultra-sharp 4x Retina PNGs, sanitize and optimize SVG code markup, or trace raster bitmaps into true SVG paths.
                    </p>

                    {/* Vector Node Visual Hint */}
                    <div className="rounded-xl border border-border bg-bg/80 p-3 font-mono text-[11px] text-muted flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        <span>Path Simplifier</span>
                      </div>
                      <span className="text-emerald-500 font-semibold">-64% markup bytes</span>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-6 mt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted">Retina @4x Scale</span>
                    <Link
                      href="/tools/svg-tools"
                      className="h-8 px-4 rounded-lg border border-border bg-surface text-text hover:border-accent hover:text-accent text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Open Studio</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  MEDIUM CARD 3: IMAGE CONVERTER (Col Span 4)
              ============================================================== */}
              {(activeCategory === "all" || activeCategory === "convert") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-5 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-md bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[11px] text-accent">
                          C
                        </span>
                        <h3 className="font-display font-bold text-[15px] text-text group-hover:text-accent transition-colors">
                          Image Converter
                        </h3>
                      </div>
                      <span className="font-mono text-[10px] text-muted">5 Formats</span>
                    </div>

                    <p className="text-[12px] text-muted">
                      Batch convert between PNG, JPG, WebP, AVIF, and BMP with fine quality control and ZIP download.
                    </p>

                    <div className="flex items-center justify-center gap-2 py-2 font-mono text-[11px] text-text bg-surface-muted/40 rounded-lg border border-border/60">
                      <span>PNG</span>
                      <span className="text-accent font-bold">→</span>
                      <span>WebP</span>
                      <span className="text-accent font-bold">→</span>
                      <span>AVIF</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end">
                    <Link
                      href="/tools/image-converter"
                      className="text-[12px] font-medium text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Launch Converter</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  MEDIUM CARD 4: IMAGE RESIZER (Col Span 4)
              ============================================================== */}
              {(activeCategory === "all" || activeCategory === "edit") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-5 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-md bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[11px] text-accent">
                          R
                        </span>
                        <h3 className="font-display font-bold text-[15px] text-text group-hover:text-accent transition-colors">
                          Image Resizer
                        </h3>
                      </div>
                      <span className="font-mono text-[10px] text-muted">Aspect Lock</span>
                    </div>

                    <p className="text-[12px] text-muted">
                      Resize images to exact pixel dimensions, percentage scaling, or social presets (1080p, IG Story).
                    </p>

                    <div className="flex items-center justify-between px-3 py-2 font-mono text-[11px] bg-surface-muted/40 rounded-lg border border-border/60">
                      <span className="text-muted">Target:</span>
                      <span className="text-accent font-semibold">1920 × 1080 px (16:9)</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end">
                    <Link
                      href="/tools/image-resizer"
                      className="text-[12px] font-medium text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Launch Resizer</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  MEDIUM CARD 5: IMAGE CROPPER (Col Span 4)
              ============================================================== */}
              {(activeCategory === "all" || activeCategory === "edit") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-5 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-md bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[11px] text-accent">
                          X
                        </span>
                        <h3 className="font-display font-bold text-[15px] text-text group-hover:text-accent transition-colors">
                          Image Cropper
                        </h3>
                      </div>
                      <span className="font-mono text-[10px] text-muted">Rule of Thirds</span>
                    </div>

                    <p className="text-[12px] text-muted">
                      Precision cropping with interactive handles, aspect ratios (1:1, 16:9, 4:3), zoom, and rotation.
                    </p>

                    <div className="flex items-center justify-center gap-3 py-2 font-mono text-[11px] text-text bg-surface-muted/40 rounded-lg border border-border/60">
                      <span>1:1 Square</span> · <span>16:9 Wide</span> · <span>4:3 Photo</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end">
                    <Link
                      href="/tools/image-cropper"
                      className="text-[12px] font-medium text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Launch Cropper</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  COMPACT UTILITY CARDS (Col Span 3 each)
              ============================================================== */}
              {(activeCategory === "all" || activeCategory === "security") && (
                <div className="lg:col-span-3 rounded-2xl border border-border bg-surface p-4 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-6 rounded bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[10px] text-accent">
                        M
                      </span>
                      <span className="font-mono text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        Sanitize
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-[14px] text-text group-hover:text-accent transition-colors">
                      EXIF & Metadata
                    </h3>
                    <p className="text-[11px] text-muted line-clamp-2">
                      Inspect camera specs, exposure, and GPS tags with 1-click privacy sanitizer.
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-border">
                    <Link href="/tools/metadata" className="text-[11px] font-medium text-accent hover:underline">
                      Open Inspector →
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "edit") && (
                <div className="lg:col-span-3 rounded-2xl border border-border bg-surface p-4 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-6 rounded bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[10px] text-accent">
                        B
                      </span>
                      <span className="font-mono text-[9px] text-muted">Eyedropper</span>
                    </div>
                    <h3 className="font-display font-bold text-[14px] text-text group-hover:text-accent transition-colors">
                      Background Keyer
                    </h3>
                    <p className="text-[11px] text-muted line-clamp-2">
                      Sample background colors to isolate subjects and export clean transparent PNGs.
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-border">
                    <Link href="/tools/background" className="text-[11px] font-medium text-accent hover:underline">
                      Open Keyer →
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "edit") && (
                <div className="lg:col-span-3 rounded-2xl border border-border bg-surface p-4 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-6 rounded bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[10px] text-accent">
                        W
                      </span>
                      <span className="font-mono text-[9px] text-muted">9 Anchors</span>
                    </div>
                    <h3 className="font-display font-bold text-[14px] text-text group-hover:text-accent transition-colors">
                      Image Watermark
                    </h3>
                    <p className="text-[11px] text-muted line-clamp-2">
                      Brand images with custom text or logo watermarks, opacity, and rotation.
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-border">
                    <Link href="/tools/watermark" className="text-[11px] font-medium text-accent hover:underline">
                      Open Watermark →
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "vector") && (
                <div className="lg:col-span-3 rounded-2xl border border-border bg-surface p-4 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-6 rounded bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[10px] text-accent">
                        6
                      </span>
                      <span className="font-mono text-[9px] text-muted">Code Utility</span>
                    </div>
                    <h3 className="font-display font-bold text-[14px] text-text group-hover:text-accent transition-colors">
                      Base64 Studio
                    </h3>
                    <p className="text-[11px] text-muted line-clamp-2">
                      Encode images to Data URIs, HTML & CSS snippets or decode raw Base64 strings.
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-border">
                    <Link href="/tools/base64" className="text-[11px] font-medium text-accent hover:underline">
                      Open Studio →
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "security") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-4 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-6 rounded bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[10px] text-accent">
                        P
                      </span>
                      <span className="font-mono text-[9px] text-muted">A4 · Letter</span>
                    </div>
                    <h3 className="font-display font-bold text-[14px] text-text group-hover:text-accent transition-colors">
                      Image → PDF
                    </h3>
                    <p className="text-[11px] text-muted line-clamp-2">
                      Compile multi-image documents into single PDFs with page ordering and margins.
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-border">
                    <Link href="/tools/image-to-pdf" className="text-[11px] font-medium text-accent hover:underline">
                      Compile PDF →
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "security") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-4 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-6 rounded bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[10px] text-accent">
                        D
                      </span>
                      <span className="font-mono text-[9px] text-muted">Up to 300 DPI</span>
                    </div>
                    <h3 className="font-display font-bold text-[14px] text-text group-hover:text-accent transition-colors">
                      PDF → Image
                    </h3>
                    <p className="text-[11px] text-muted line-clamp-2">
                      Extract high-res PNG, JPG, or WebP pages from PDF files with ZIP bundle export.
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-border">
                    <Link href="/tools/pdf-to-image" className="text-[11px] font-medium text-accent hover:underline">
                      Extract Pages →
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "edit") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-4 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-6 rounded bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[10px] text-accent">
                        T
                      </span>
                      <span className="font-mono text-[9px] text-muted">90° · 180°</span>
                    </div>
                    <h3 className="font-display font-bold text-[14px] text-text group-hover:text-accent transition-colors">
                      Rotate & Flip
                    </h3>
                    <p className="text-[11px] text-muted line-clamp-2">
                      Lossless canvas rotation, horizontal flipping, and vertical mirroring.
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-border">
                    <Link href="/tools/image-rotate-flip" className="text-[11px] font-medium text-accent hover:underline">
                      Open Tool →
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "convert") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-5 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-md bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-[11px] text-accent">
                          I
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-[15px] text-text group-hover:text-accent transition-colors">
                            Image Info & Palette
                          </h3>
                          <span className="font-mono text-[10px] text-muted">Asset Diagnostics</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
                        Color Extraction
                      </span>
                    </div>

                    <p className="text-[12px] text-muted leading-relaxed">
                      Instant client-side diagnostics: exact pixel resolution, aspect ratio, megapixels, alpha transparency, and dominant HEX color palette.
                    </p>

                    <div className="flex items-center gap-1.5 py-1.5">
                      <div className="h-4 w-6 rounded bg-blue-500/80 shadow-xs" />
                      <div className="h-4 w-6 rounded bg-indigo-500/80 shadow-xs" />
                      <div className="h-4 w-6 rounded bg-emerald-500/80 shadow-xs" />
                      <div className="h-4 w-6 rounded bg-amber-500/80 shadow-xs" />
                      <div className="h-4 w-6 rounded bg-rose-500/80 shadow-xs" />
                      <span className="font-mono text-[10px] text-muted ml-1">+ HEX</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted">Quantization</span>
                    <Link
                      href="/tools/image-info"
                      className="text-[12px] font-medium text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Inspect Image</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "convert" || activeCategory === "vector") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-5 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-md bg-accent text-white flex items-center justify-center font-mono font-bold text-[12px] shadow-xs">
                          F
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-[15px] text-text group-hover:text-accent transition-colors">
                            Favicon Studio & ZIP
                          </h3>
                          <span className="font-mono text-[10px] text-muted">Complete Web Suite</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">
                        All Sizes + ZIP
                      </span>
                    </div>

                    <p className="text-[12px] text-muted leading-relaxed">
                      Generate multi-resolution <code>favicon.ico</code> (16/32/48px), Apple Touch (180px), Android Chrome (512px), and <code>site.webmanifest</code> in one ZIP download.
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 py-1 font-mono text-[10px]">
                      <span className="rounded bg-surface-muted border border-border/80 px-2 py-0.5 text-text">ICO (16-48px)</span>
                      <span className="rounded bg-surface-muted border border-border/80 px-2 py-0.5 text-text">Apple 180px</span>
                      <span className="rounded bg-accent/10 text-accent font-semibold px-2 py-0.5 border border-accent/20">.ZIP</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted">ICO binary</span>
                    <Link
                      href="/tools/favicon-generator"
                      className="text-[12px] font-medium text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Create Favicon</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}

              {(activeCategory === "all" || activeCategory === "vector" || activeCategory === "convert") && (
                <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-5 shadow-xs card-interactive flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-md bg-accent text-white flex items-center justify-center font-mono font-bold text-[12px] shadow-xs">
                          V
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-[15px] text-text group-hover:text-accent transition-colors">
                            SVG Viewer & Editor
                          </h3>
                          <span className="font-mono text-[10px] text-muted">Live Code Studio</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Live Preview
                      </span>
                    </div>

                    <p className="text-[12px] text-muted leading-relaxed">
                      Paste SVG code directly, inspect viewBox and nodes in real-time, swap colors across paths, and save as optimized SVG or 4x Retina PNG.
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 py-1 font-mono text-[10px]">
                      <span className="rounded bg-surface-muted border border-border/80 px-2 py-0.5 text-text">Code Editor</span>
                      <span className="rounded bg-surface-muted border border-border/80 px-2 py-0.5 text-text">Color Swap</span>
                      <span className="rounded bg-surface-muted border border-border/80 px-2 py-0.5 text-text">JSX &amp; PNG</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted">Direct Paste &amp; Save</span>
                    <Link
                      href="/tools/svg-viewer"
                      className="text-[12px] font-medium text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Open SVG Editor</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 3: "SEE THE DIFFERENCE" VISUAL BEFORE/AFTER
            Immediately proves image transformation capability with real slider
        =================================================================== */}
        <section id="compare-section" className="py-16 sm:py-24 border-b border-border/60 bg-surface/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <div className="inline-flex items-center gap-1.5 text-accent font-mono text-[11px] font-semibold tracking-wider uppercase">
                <span>✦ Visual Verification</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-text tracking-tight">
                SEE THE DIFFERENCE.
              </h2>
              <p className="text-muted text-[15px]">
                Drag the divider below to inspect lossless visual quality versus massive byte reduction.
              </p>
            </div>

            {/* Draggable Comparison Widget */}
            <div className="rounded-2xl border-2 border-border bg-surface shadow-card p-4 sm:p-6">
              <BeforeAfterPreview
                beforeUrl={DEMO_ORIGINAL}
                afterUrl={DEMO_COMPRESSED}
                beforeLabel="Original Camera JPEG"
                afterLabel="DocForge WebP (Compressed)"
                beforeStats="3.8 MB · 100% Quality"
                afterStats="710 KB · 75% Quality"
                savingsBadge="81% Smaller"
              />

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border font-mono text-[12px]">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <div>
                    <span className="text-muted block text-[10px]">ALGORITHM</span>
                    <span className="text-text font-semibold">WebAssembly MozJPEG / WebP</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="text-muted block text-[10px]">BANDWIDTH SAVED</span>
                    <span className="text-emerald-500 font-semibold">3.09 MB Per Image</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <div>
                    <span className="text-muted block text-[10px]">PRIVACY</span>
                    <span className="text-text font-semibold">Processed 100% On Device</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 4: "BUILT FOR SPEED" PIPELINE ARCHITECTURE
            Visual pipeline demonstrating zero-upload browser execution
        =================================================================== */}
        <section className="py-16 sm:py-24 border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <div className="inline-flex items-center gap-1.5 text-accent font-mono text-[11px] font-semibold tracking-wider uppercase">
                <span>✦ Engine Architecture</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-text tracking-tight">
                BUILT FOR ZERO-LATENCY SPEED.
              </h2>
              <p className="text-muted text-[15px]">
                Traditional tools upload your private images to cloud queues. DocForge runs a sandboxed engine directly inside your browser.
              </p>
            </div>

            {/* Pipeline Flowchart Visual with Animated Energy Beam */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Traveling Energy Beam Connector Track */}
              <div className="hidden md:block absolute top-1/2 left-6 right-6 h-0.5 bg-border/80 -translate-y-1/2 overflow-hidden pointer-events-none z-0">
                <div className="h-full w-56 bg-gradient-to-r from-transparent via-accent to-transparent animate-beam-flow" />
              </div>

              {/* Step 1 */}
              <div className="rounded-xl border border-border bg-surface/95 backdrop-blur-xs p-5 shadow-xs relative z-10 card-interactive group">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-muted">STEP 01</span>
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                </div>
                <h4 className="font-display font-bold text-[15px] text-text mt-1">Your Local File</h4>
                <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
                  Raw binary is read into browser memory via FileReader and Blob URLs.
                </p>
                <div className="mt-4 font-mono text-[11px] text-accent font-semibold">
                  0.0ms Upload Time
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-border bg-surface/95 backdrop-blur-xs p-5 shadow-xs relative z-10 card-interactive group">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-muted">STEP 02</span>
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                </div>
                <h4 className="font-display font-bold text-[15px] text-text mt-1">Local Sandboxing</h4>
                <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
                  Execution happens inside WebAssembly and hardware-accelerated 2D Canvas.
                </p>
                <div className="mt-4 font-mono text-[11px] text-accent font-semibold">
                  100% Private Sandbox
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-border bg-surface/95 backdrop-blur-xs p-5 shadow-xs relative z-10 card-interactive group">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-muted">STEP 03</span>
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                </div>
                <h4 className="font-display font-bold text-[15px] text-text mt-1">Transformation</h4>
                <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
                  Quantization, vector tracing, bicubic resampling, and metadata sanitization.
                </p>
                <div className="mt-4 font-mono text-[11px] text-accent font-semibold">
                  Native GPU/CPU Speeds
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-border bg-surface/95 backdrop-blur-xs p-5 shadow-xs relative z-10 card-interactive group">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-muted">STEP 04</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h4 className="font-display font-bold text-[15px] text-text mt-1">Direct Download</h4>
                <p className="text-[12px] text-muted mt-1.5 leading-relaxed">
                  Files are saved straight to your disk individually or as a compressed ZIP archive.
                </p>
                <div className="mt-4 font-mono text-[11px] text-emerald-500 font-semibold">
                  Zero Cloud Wait
                </div>
              </div>
            </div>

            {/* Cloud vs DocForge Comparison Matrix */}
            <div className="mt-8 rounded-2xl border border-border bg-border overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px text-center font-mono text-[12px]">
                <div className="bg-surface p-3 sm:p-4">
                  <span className="text-muted block text-[10px] uppercase">Upload Bandwidth</span>
                  <span className="text-text font-semibold text-[13px] sm:text-[14px] mt-1 block">0 MB (Zero)</span>
                </div>
                <div className="bg-surface p-3 sm:p-4">
                  <span className="text-muted block text-[10px] uppercase">Queue Delay</span>
                  <span className="text-text font-semibold text-[13px] sm:text-[14px] mt-1 block">0.0 Seconds</span>
                </div>
                <div className="bg-surface p-3 sm:p-4">
                  <span className="text-muted block text-[10px] uppercase">Third-Party Storage</span>
                  <span className="text-emerald-500 font-semibold text-[13px] sm:text-[14px] mt-1 block">Never Stored</span>
                </div>
                <div className="bg-surface p-3 sm:p-4">
                  <span className="text-muted block text-[10px] uppercase">Account Required</span>
                  <span className="text-text font-semibold text-[13px] sm:text-[14px] mt-1 block">No Sign-up</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
