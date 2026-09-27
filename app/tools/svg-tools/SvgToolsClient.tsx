"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { formatBytes, calculateSavings, readFileAsText, loadImage } from "@/lib/fileUtils";
import {
  svgToRaster,
  optimizeSvg,
  wrapRasterInSvg,
  vectorizeRasterToSvg,
} from "@/lib/svgUtils";
import { saveAs } from "file-saver";

type TabMode = "svg-to-raster" | "svg-optimizer" | "image-to-svg";

export default function SvgToolsClient() {
  const [activeTab, setActiveTab] = useState<TabMode>("svg-to-raster");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Tab 1: SVG to Raster state
  const [svgContent, setSvgContent] = useState<string>("");
  const [svgFileName, setSvgFileName] = useState<string>("graphic.svg");
  const [rasterFormat, setRasterFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [scale, setScale] = useState<number>(2);
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [isExportingRaster, setIsExportingRaster] = useState<boolean>(false);
  const [renderedRaster, setRenderedRaster] = useState<{ blob: Blob; dataUrl: string; width: number; height: number } | null>(null);

  // Tab 2: SVG Optimizer state
  const [optSvgInput, setOptSvgInput] = useState<string>("");
  const [optResult, setOptResult] = useState<{ optimizedSvg: string; originalSize: number; optimizedSize: number } | null>(null);
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);
  const [minifyWhitespace, setMinifyWhitespace] = useState<boolean>(true);
  const [roundPrecision, setRoundPrecision] = useState<number>(2);

  // Tab 3: Image to SVG state
  const [rasterFile, setRasterFile] = useState<File | null>(null);
  const [rasterPreviewUrl, setRasterPreviewUrl] = useState<string>("");
  const [vectorMode, setVectorMode] = useState<"true-vector" | "wrapper">("true-vector");
  const [numColors, setNumColors] = useState<number>(6);
  const [minArea, setMinArea] = useState<number>(4);
  const [isVectorizing, setIsVectorizing] = useState<boolean>(false);
  const [generatedSvg, setGeneratedSvg] = useState<string>("");
  const [showSvgCode, setShowSvgCode] = useState<boolean>(false);

  const codeAreaRef = useRef<HTMLTextAreaElement>(null);

  // Handlers for SVG to Raster
  async function handleSvgUpload(files: File[]) {
    const file = files[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      setSvgContent(text);
      setSvgFileName(file.name);
      setRenderedRaster(null);
      setToastMsg(`Loaded ${file.name}`);
    } catch {
      setToastMsg("Could not read SVG file.");
    }
  }

  async function handleConvertSvgToRaster() {
    if (!svgContent) return;
    setIsExportingRaster(true);
    try {
      const res = await svgToRaster(svgContent, {
        format: rasterFormat,
        scale,
        width: customWidth ? Number(customWidth) : undefined,
        height: customHeight ? Number(customHeight) : undefined,
        backgroundColor: bgColor,
      });
      setRenderedRaster(res);
      setToastMsg("SVG rendered successfully!");
    } catch (err: unknown) {
      console.error(err);
      setToastMsg(err instanceof Error ? err.message : "Error rendering SVG");
    } finally {
      setIsExportingRaster(false);
    }
  }

  function downloadRaster() {
    if (!renderedRaster) return;
    const ext = rasterFormat === "image/png" ? "png" : rasterFormat === "image/jpeg" ? "jpg" : "webp";
    const baseName = svgFileName.replace(/\.svg$/i, "");
    saveAs(renderedRaster.blob, `${baseName}-${renderedRaster.width}x${renderedRaster.height}.${ext}`);
  }

  // Handlers for SVG Optimizer
  function handleOptimizeSvg() {
    if (!optSvgInput.trim()) return;
    const res = optimizeSvg(optSvgInput, {
      removeComments,
      removeMetadata,
      removeDoctype: true,
      minifyWhitespace,
      roundPrecision,
    });
    setOptResult(res);
    setToastMsg("SVG optimized!");
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setToastMsg(`Copied ${label} to clipboard!`);
  }

  // Handlers for Image to SVG
  async function handleRasterUpload(files: File[]) {
    const file = files[0];
    if (!file) return;
    setRasterFile(file);
    const url = URL.createObjectURL(file);
    setRasterPreviewUrl(url);
    setGeneratedSvg("");
    setToastMsg(`Loaded ${file.name}`);
  }

  async function handleProcessRasterToSvg() {
    if (!rasterFile || !rasterPreviewUrl) return;
    setIsVectorizing(true);
    setGeneratedSvg("");
    try {
      const img = await loadImage(rasterPreviewUrl);

      if (vectorMode === "wrapper") {
        const svg = wrapRasterInSvg(rasterPreviewUrl, img.naturalWidth, img.naturalHeight);
        setGeneratedSvg(svg);
        setToastMsg("Created SVG wrapper.");
      } else {
        const svg = await vectorizeRasterToSvg(img, {
          numColors,
          smoothing: 1,
          minArea,
        });
        setGeneratedSvg(svg);
        setToastMsg("True vector paths traced successfully!");
      }
    } catch (err) {
      console.error(err);
      setToastMsg("Vectorization failed.");
    } finally {
      setIsVectorizing(false);
    }
  }

  function downloadGeneratedSvg() {
    if (!generatedSvg) return;
    const blob = new Blob([generatedSvg], { type: "image/svg+xml;charset=utf-8" });
    const baseName = rasterFile ? rasterFile.name.replace(/\.[^.]+$/, "") : "vector";
    saveAs(blob, `${baseName}-${vectorMode}.svg`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <ToolHeader
            tag="03"
            title="SVG Studio & Vectorizer"
            description="Render SVG graphics to high-resolution raster images, clean SVG markup, or trace raster images into real vector paths."
            badge="Vector Suite"
          />

          {/* Segmented Tab Controls */}
          <div className="flex overflow-x-auto scrollbar-none sm:grid sm:grid-cols-3 gap-1 rounded-xl border border-border bg-surface p-1 mb-8 max-w-xl mx-auto shadow-sm">
            <button
              onClick={() => setActiveTab("svg-to-raster")}
              className={`rounded-lg py-1.5 px-3 whitespace-nowrap text-[12px] font-medium transition-all shrink-0 sm:shrink text-center ${
                activeTab === "svg-to-raster"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-text hover:bg-surface-hover"
              }`}
            >
              1. SVG → Raster
            </button>
            <button
              onClick={() => setActiveTab("svg-optimizer")}
              className={`rounded-lg py-1.5 px-3 whitespace-nowrap text-[12px] font-medium transition-all shrink-0 sm:shrink text-center ${
                activeTab === "svg-optimizer"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-text hover:bg-surface-hover"
              }`}
            >
              2. SVG Optimizer
            </button>
            <button
              onClick={() => setActiveTab("image-to-svg")}
              className={`rounded-lg py-1.5 px-3 whitespace-nowrap text-[12px] font-medium transition-all shrink-0 sm:shrink text-center ${
                activeTab === "image-to-svg"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-text hover:bg-surface-hover"
              }`}
            >
              3. Image → Vectorizer
            </button>
          </div>

          {/* TAB 1: SVG TO RASTER */}
          {activeTab === "svg-to-raster" && (
            <div className="space-y-6 animate-fade-in">
              <Dropzone
                accept=".svg,image/svg+xml"
                multiple={false}
                onFiles={handleSvgUpload}
                label={svgContent ? svgFileName : "Drop an SVG file here, or click to browse"}
                hint="SVG vector graphic · Renders at any resolution"
              />

              {svgContent && (
                <div className="space-y-6">
                  {/* Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 rounded-xl border border-border bg-surface p-4 text-[12px]">
                    <div>
                      <label htmlFor="raster-format" className="block text-muted font-medium mb-1">Export Format</label>
                      <select
                        id="raster-format"
                        value={rasterFormat}
                        onChange={(e) => setRasterFormat(e.target.value as "image/png" | "image/jpeg" | "image/webp")}
                        className="w-full focus-ring rounded-md border border-border bg-bg px-2.5 py-1.5 text-text"
                      >
                        <option value="image/png">PNG (Transparent)</option>
                        <option value="image/jpeg">JPG / JPEG</option>
                        <option value="image/webp">WebP</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="raster-scale" className="block text-muted font-medium mb-1">Scale Multiplier</label>
                      <select
                        id="raster-scale"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full focus-ring rounded-md border border-border bg-bg px-2.5 py-1.5 text-text"
                      >
                        <option value={1}>1x (Original)</option>
                        <option value={2}>2x (Retina @2x)</option>
                        <option value={3}>3x (Ultra @3x)</option>
                        <option value={4}>4x (Print / 4K)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="custom-width" className="block text-muted font-medium mb-1">Custom Width (px)</label>
                      <input
                        id="custom-width"
                        type="number"
                        placeholder="Auto"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-full focus-ring rounded-md border border-border bg-bg px-2.5 py-1.5 text-text"
                      />
                    </div>

                    <div>
                      <label htmlFor="bg-color" className="block text-muted font-medium mb-1">Background</label>
                      <select
                        id="bg-color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full focus-ring rounded-md border border-border bg-bg px-2.5 py-1.5 text-text"
                      >
                        <option value="transparent">Transparent</option>
                        <option value="#ffffff">White (#ffffff)</option>
                        <option value="#000000">Black (#000000)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={handleConvertSvgToRaster}
                      disabled={isExportingRaster}
                      className="h-9 rounded-md bg-accent px-5 text-[13px] font-medium text-white shadow-sm shadow-accent/20 hover:bg-accent-strong disabled:opacity-50"
                    >
                      {isExportingRaster ? "Rendering…" : "Render raster image"}
                    </button>
                    {renderedRaster && (
                      <button
                        onClick={downloadRaster}
                        className="h-9 rounded-md border border-accent text-accent px-5 text-[13px] font-medium hover:bg-accent/10"
                      >
                        Download {renderedRaster.width} × {renderedRaster.height}
                      </button>
                    )}
                  </div>

                  {/* Previews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-surface p-4">
                      <p className="font-mono text-[11px] text-muted mb-2">SVG Vector Preview</p>
                      <div
                        className="flex h-64 items-center justify-center overflow-hidden rounded-lg bg-bg/50 p-4 border border-border/50"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                      />
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-4">
                      <p className="font-mono text-[11px] text-accent mb-2">
                        {renderedRaster ? `Rendered Output (${renderedRaster.width} × ${renderedRaster.height} px · ${formatBytes(renderedRaster.blob.size)})` : "Rendered Output"}
                      </p>
                      <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg bg-bg/50 p-4 border border-border/50">
                        {renderedRaster ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={renderedRaster.dataUrl}
                            alt="Raster preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[13px] text-muted/60">
                            Click &ldquo;Render raster image&rdquo; to generate
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SVG OPTIMIZER */}
          {activeTab === "svg-optimizer" && (
            <div className="space-y-6 animate-fade-in">
              <Dropzone
                accept=".svg,image/svg+xml"
                multiple={false}
                onFiles={async (files) => {
                  if (files[0]) {
                    const text = await readFileAsText(files[0]);
                    setOptSvgInput(text);
                    setToastMsg(`Loaded ${files[0].name}`);
                  }
                }}
                label="Drop SVG file to optimize"
                hint="or paste markup in the box below"
              />

              <div>
                <label className="block text-[12px] font-medium text-text mb-1.5">
                  SVG Markup / Code
                </label>
                <textarea
                  value={optSvgInput}
                  onChange={(e) => setOptSvgInput(e.target.value)}
                  placeholder="<svg xmlns='http://www.w3.org/2000/svg' ...>...</svg>"
                  rows={5}
                  className="w-full focus-ring rounded-lg border border-border bg-surface p-3 font-mono text-[11px] text-text"
                />
              </div>

              {/* Optimization Settings */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 rounded-xl border border-border bg-surface p-4 text-[12px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeComments}
                    onChange={(e) => setRemoveComments(e.target.checked)}
                    className="accent-accent"
                  />
                  <span>Strip comments</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeMetadata}
                    onChange={(e) => setRemoveMetadata(e.target.checked)}
                    className="accent-accent"
                  />
                  <span>Remove metadata</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minifyWhitespace}
                    onChange={(e) => setMinifyWhitespace(e.target.checked)}
                    className="accent-accent"
                  />
                  <span>Minify whitespace</span>
                </label>

                <div className="flex items-center gap-2">
                  <label htmlFor="precision-select" className="text-muted">Decimals:</label>
                  <select
                    id="precision-select"
                    value={roundPrecision}
                    onChange={(e) => setRoundPrecision(Number(e.target.value))}
                    className="focus-ring rounded-md border border-border bg-bg px-2 py-1 text-text text-[12px]"
                  >
                    <option value={1}>1 decimal</option>
                    <option value={2}>2 decimals</option>
                    <option value={3}>3 decimals</option>
                  </select>
                </div>

                <button
                  onClick={handleOptimizeSvg}
                  className="h-8 w-full sm:w-auto sm:ml-auto rounded-md bg-accent px-4 text-[12px] font-medium text-white shadow-sm hover:bg-accent-strong transition-all"
                >
                  Optimize SVG
                </button>
              </div>

              {/* Optimization Results */}
              {optResult && (
                <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] border-b border-border/80 pb-3">
                    <div>
                      <span className="text-muted">Original: </span>
                      <span className="text-text font-medium">{formatBytes(optResult.originalSize)}</span>
                      <span className="mx-2 text-border">→</span>
                      <span className="text-accent font-semibold">{formatBytes(optResult.optimizedSize)}</span>
                      {(() => {
                        const sav = calculateSavings(optResult.originalSize, optResult.optimizedSize);
                        return (
                          <span className="ml-3 rounded-full bg-accent/15 px-2.5 py-0.5 text-accent font-bold text-[11px]">
                            -{sav.percentage}% reduction
                          </span>
                        );
                      })()}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(optResult.optimizedSvg, "optimized SVG")}
                        className="h-7 rounded-md border border-border px-3 text-[11px] font-medium text-text hover:border-accent"
                      >
                        Copy code
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([optResult.optimizedSvg], { type: "image/svg+xml;charset=utf-8" });
                          saveAs(blob, "optimized.svg");
                        }}
                        className="h-7 rounded-md bg-accent px-3 text-[11px] font-medium text-white hover:bg-accent-strong"
                      >
                        Download SVG
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    value={optResult.optimizedSvg}
                    rows={5}
                    className="w-full focus-ring rounded-lg border border-border bg-bg p-3 font-mono text-[11px] text-text"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMAGE TO SVG */}
          {activeTab === "image-to-svg" && (
            <div className="space-y-6 animate-fade-in">
              <Dropzone
                accept="image/png,image/jpeg,image/webp"
                multiple={false}
                onFiles={handleRasterUpload}
                label={rasterFile ? rasterFile.name : "Drop PNG or JPG to vectorize"}
                hint="Raster image to scalable vector output"
              />

              {rasterFile && (
                <div className="space-y-6">
                  {/* Mode Selector */}
                  <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                      Vectorization Mode
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        onClick={() => setVectorMode("true-vector")}
                        className={`cursor-pointer rounded-lg border p-4 transition-all ${
                          vectorMode === "true-vector"
                            ? "border-accent bg-accent/5 ring-1 ring-accent"
                            : "border-border hover:border-accent/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-medium text-[14px] text-text">
                            True Vectorization
                          </span>
                          <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] text-accent font-semibold">
                            Real Paths
                          </span>
                        </div>
                        <p className="mt-2 text-[12px] text-muted leading-relaxed">
                          Quantizes image into discrete color layers and traces genuine vector &lt;path&gt; contours. Infinitely scalable with real editable geometry.
                        </p>
                      </div>

                      <div
                        onClick={() => setVectorMode("wrapper")}
                        className={`cursor-pointer rounded-lg border p-4 transition-all ${
                          vectorMode === "wrapper"
                            ? "border-accent bg-accent/5 ring-1 ring-accent"
                            : "border-border hover:border-accent/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-medium text-[14px] text-text">
                            SVG Image Wrapper
                          </span>
                          <span className="rounded bg-muted/15 px-2 py-0.5 font-mono text-[10px] text-muted font-semibold">
                            Embedded Raster
                          </span>
                        </div>
                        <p className="mt-2 text-[12px] text-muted leading-relaxed">
                          Wraps the raster image inside an SVG container with responsive viewBox and dimensions. Note: Does not trace vector lines.
                        </p>
                      </div>
                    </div>

                    {vectorMode === "true-vector" && (
                      <div className="flex flex-wrap items-center gap-6 pt-2 text-[12px]">
                        <div className="flex items-center gap-2">
                          <label htmlFor="color-layers" className="text-muted font-medium">Color Layers: {numColors}</label>
                          <input
                            id="color-layers"
                            type="range"
                            min="2"
                            max="16"
                            value={numColors}
                            onChange={(e) => setNumColors(Number(e.target.value))}
                            className="h-1.5 w-24 accent-accent cursor-pointer bg-bg border border-border"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label htmlFor="detail-filter" className="text-muted font-medium">Detail Filter: {minArea}px</label>
                          <input
                            id="detail-filter"
                            type="range"
                            min="1"
                            max="16"
                            value={minArea}
                            onChange={(e) => setMinArea(Number(e.target.value))}
                            className="h-1.5 w-24 accent-accent cursor-pointer bg-bg border border-border"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handleProcessRasterToSvg}
                        disabled={isVectorizing}
                        className="h-9 rounded-md bg-accent px-5 text-[13px] font-medium text-white shadow-sm shadow-accent/20 hover:bg-accent-strong disabled:opacity-50"
                      >
                        {isVectorizing ? "Tracing vector contours…" : "Generate SVG"}
                      </button>
                    </div>
                  </div>

                  {/* Generated SVG Result */}
                  {generatedSvg && (
                    <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] border-b border-border/80 pb-3">
                        <span className="text-accent font-semibold">
                          ✓ SVG Generated ({formatBytes(new Blob([generatedSvg]).size)})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowSvgCode(!showSvgCode)}
                            className="h-7 rounded-md border border-border px-3 text-[11px] font-medium text-muted hover:text-text"
                          >
                            {showSvgCode ? "Hide code" : "View code"}
                          </button>
                          <button
                            onClick={() => copyToClipboard(generatedSvg, "SVG markup")}
                            className="h-7 rounded-md border border-border px-3 text-[11px] font-medium text-text hover:border-accent"
                          >
                            Copy SVG
                          </button>
                          <button
                            onClick={downloadGeneratedSvg}
                            className="h-7 rounded-md bg-accent px-3 text-[11px] font-medium text-white hover:bg-accent-strong"
                          >
                            Download .svg
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-border bg-bg/50 p-4">
                          <p className="font-mono text-[11px] text-muted mb-2">Original Raster</p>
                          <div className="flex h-56 items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={rasterPreviewUrl}
                              alt="Raster preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        </div>

                        <div className="rounded-lg border border-border bg-bg/50 p-4">
                          <p className="font-mono text-[11px] text-accent mb-2">
                            Vector Output ({vectorMode === "true-vector" ? "Real SVG Paths" : "Embedded Wrapper"})
                          </p>
                          <div
                            className="flex h-56 items-center justify-center overflow-hidden [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto"
                            dangerouslySetInnerHTML={{ __html: generatedSvg }}
                          />
                        </div>
                      </div>

                      {showSvgCode && (
                        <div className="mt-4">
                          <textarea
                            ref={codeAreaRef}
                            readOnly
                            value={generatedSvg}
                            rows={8}
                            className="w-full focus-ring rounded-lg border border-border bg-bg p-3 font-mono text-[11px] text-text"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
