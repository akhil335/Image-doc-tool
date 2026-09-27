"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { formatBytes, readFileAsText } from "@/lib/fileUtils";
import { svgToRaster } from "@/lib/svgUtils";
import {
  formatSvgXml,
  minifySvg,
  parseSvgStats,
  replaceColorInSvg,
  svgToJsx,
  svgToDataUri,
  SAMPLE_SVGS,
  SvgStats,
} from "@/lib/svgEditorUtils";
import { saveAs } from "file-saver";

type BackgroundMode = "dark" | "light" | "checker" | "white" | "black" | "custom";
type ExportFormat = "svg" | "png" | "jpeg" | "webp";

export default function SvgViewerClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [svgCode, setSvgCode] = useState<string>(SAMPLE_SVGS[0].code);
  const [filename, setFilename] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Viewer controls
  const [zoom, setZoom] = useState<number>(100);
  const [bgMode, setBgMode] = useState<BackgroundMode>("checker");
  const [customBgColor, setCustomBgColor] = useState<string>("#1E293B");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"code" | "colors" | "export">("code");

  // Export settings
  const [exportScale, setExportScale] = useState<number>(2);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Color replacement state
  const [selectedOldColor, setSelectedOldColor] = useState<string>("");
  const [replacementColor, setReplacementColor] = useState<string>("#6366F1");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live parsed stats
  const stats: SvgStats = useMemo(() => {
    return parseSvgStats(svgCode);
  }, [svgCode]);

  // Code editor line numbers
  const lineCount = useMemo(() => {
    return Math.max(1, svgCode.split("\n").length);
  }, [svgCode]);

  // Handle file drop/upload
  async function handleFileUpload(file: File) {
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      setSvgCode(text);
      setFilename(file.name.endsWith(".svg") ? file.name : `${file.name}.svg`);
      setToastMsg(`Loaded "${file.name}"`);
    } catch {
      setToastMsg("Failed to read SVG file");
    }
  }

  // Prettify / Format
  function handleFormatXml() {
    const formatted = formatSvgXml(svgCode);
    setSvgCode(formatted);
    setToastMsg("SVG XML formatted");
  }

  // Minify
  function handleMinify() {
    const minified = minifySvg(svgCode);
    setSvgCode(minified);
    setToastMsg("SVG code minified");
  }

  // Copy SVG Code
  async function handleCopySvg() {
    try {
      await navigator.clipboard.writeText(svgCode);
      setToastMsg("SVG markup copied to clipboard!");
    } catch {
      setToastMsg("Clipboard copy failed");
    }
  }

  // Copy JSX
  async function handleCopyJsx() {
    try {
      const name = filename.replace(/[^a-zA-Z0-9]/g, "");
      const compName = name ? `${name.charAt(0).toUpperCase()}${name.slice(1)}Icon` : "SvgIcon";
      const jsx = svgToJsx(svgCode, compName);
      await navigator.clipboard.writeText(jsx);
      setToastMsg("React JSX component copied!");
    } catch {
      setToastMsg("Copy failed");
    }
  }

  // Copy Data URI
  async function handleCopyDataUri(base64 = false) {
    try {
      const uri = svgToDataUri(svgCode, base64);
      await navigator.clipboard.writeText(uri);
      setToastMsg(`Copied ${base64 ? "Base64" : "UTF-8"} Data URI!`);
    } catch {
      setToastMsg("Copy failed");
    }
  }

  // Replace a specific color in SVG
  function handleApplyColorReplace() {
    if (!selectedOldColor) return;
    const updated = replaceColorInSvg(svgCode, selectedOldColor, replacementColor);
    setSvgCode(updated);
    setToastMsg(`Replaced ${selectedOldColor} → ${replacementColor}`);
    setSelectedOldColor("");
  }

  // Save / Export execution
  async function handleSave() {
    if (!svgCode.trim()) return;
    const baseName = filename.replace(/\.[^/.]+$/, "") || "graphic";

    if (exportFormat === "svg") {
      const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
      saveAs(blob, `${baseName}.svg`);
      setToastMsg(`Saved ${baseName}.svg`);
      return;
    }

    // Raster export
    setIsExporting(true);
    try {
      const mime =
        exportFormat === "png"
          ? "image/png"
          : exportFormat === "webp"
            ? "image/webp"
            : "image/jpeg";

      const bg =
        bgMode === "checker" || bgMode === "custom"
          ? bgMode === "custom"
            ? customBgColor
            : "transparent"
          : bgMode === "white"
            ? "#ffffff"
            : bgMode === "black"
              ? "#000000"
              : bgMode === "dark"
                ? "#0f172a"
                : "#f8fafc";

      const result = await svgToRaster(svgCode, {
        scale: exportScale,
        format: mime,
        backgroundColor: bg,
      });

      saveAs(result.blob, `${baseName}@${exportScale}x.${exportFormat}`);
      setToastMsg(`Exported ${baseName}@${exportScale}x.${exportFormat}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Raster export failed";
      setToastMsg(`Export error: ${message}`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text bg-studio-grid">
      <Header />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
          <ToolHeader
            tag="15 · Vector Studio"
            title="SVG Viewer & Code Editor"
            description="Inspect, live edit SVG markup, tweak parameters and colors, paste raw code directly, and save as optimized SVG or hi-res PNG."
            badge="Live Code Studio"
          />

          {/* Top Quick Actions Bar */}
          <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-xs">
            {/* Left Action Cluster: File naming & presets */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="filename.svg"
                className="h-8 flex-1 sm:flex-none sm:w-44 rounded-lg border border-border bg-bg px-2.5 font-mono text-[12px] text-text focus:border-accent focus:outline-none transition-colors"
                title="Filename to save"
              />



              {/* Upload Local SVG button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-3 rounded-lg border border-border bg-surface hover:border-accent hover:text-accent font-mono text-[11px] text-muted transition-colors flex items-center gap-1.5 shrink-0"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14H2.75Z" />
                  <path d="M7.25 3.56V10a.75.75 0 0 0 1.5 0V3.56l2.22 2.22a.75.75 0 1 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 0 0 1.06 1.06l2.22-2.22Z" />
                </svg>
                <span>Open File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </div>

            {/* Right Action Cluster: Code Tools & Primary Save */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleFormatXml}
                  className="h-8 px-2 sm:px-2.5 rounded-lg border border-border bg-surface hover:border-accent hover:text-accent text-[11px] font-mono text-muted transition-colors"
                  title="Format & indent XML code"
                >
                  Prettify
                </button>

                <button
                  type="button"
                  onClick={handleMinify}
                  className="h-8 px-2 sm:px-2.5 rounded-lg border border-border bg-surface hover:border-accent hover:text-accent text-[11px] font-mono text-muted transition-colors"
                  title="Remove whitespace and comments"
                >
                  Minify
                </button>

                <button
                  type="button"
                  onClick={handleCopySvg}
                  className="h-8 px-2 sm:px-2.5 rounded-lg border border-border bg-surface hover:border-accent hover:text-accent text-[11px] font-mono text-muted transition-colors"
                  title="Copy raw SVG code"
                >
                  Copy
                </button>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={!stats.isValid || isExporting}
                className="h-8 px-3 sm:px-4 rounded-lg bg-accent text-white font-medium text-[11px] sm:text-[12px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
              >
                {isExporting ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14H2.75Z" />
                    <path d="M8.75 1.75a.75.75 0 0 0-1.5 0v6.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 1 0-1.06-1.06L8.75 8.44V1.75Z" />
                  </svg>
                )}
                <span>Save .SVG</span>
              </button>
            </div>
          </div>

          {/* ===================================================================
              TWO-COLUMN WORKSPACE: LEFT (CODE EDITOR) · RIGHT (LIVE VIEWER)
          =================================================================== */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ==============================================================
                LEFT COLUMN: CODE EDITOR & ELEMENT INSPECTOR (5 cols)
            ============================================================== */}
            <div className="lg:col-span-6 flex flex-col rounded-2xl border border-border bg-surface shadow-xs overflow-hidden min-h-[580px]">
              {/* Studio Tab Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-muted/50 text-[12px]">
                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab("code")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${activeTab === "code"
                      ? "bg-surface text-accent font-bold shadow-xs border border-border"
                      : "text-muted hover:text-text"
                      }`}
                  >
                    Raw SVG Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("colors")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${activeTab === "colors"
                      ? "bg-surface text-accent font-bold shadow-xs border border-border"
                      : "text-muted hover:text-text"
                      }`}
                  >
                    <span>Colors</span>
                    {stats.colors.length > 0 && (
                      <span className="h-4 px-1 rounded-full bg-accent/20 text-accent text-[9px] font-bold flex items-center justify-center">
                        {stats.colors.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("export")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${activeTab === "export"
                      ? "bg-surface text-accent font-bold shadow-xs border border-border"
                      : "text-muted hover:text-text"
                      }`}
                  >
                    Export & Share
                  </button>
                </div>

                {/* Validation Status Indicator */}
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  {stats.isValid ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Valid SVG
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-500 font-semibold" title={stats.error}>
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Syntax Error
                    </span>
                  )}
                </div>
              </div>

              {/* TAB 1: CODE EDITOR */}
              {activeTab === "code" && (
                <div className="flex-1 flex flex-col p-2">
                  {/* Parsing error alert banner */}
                  {!stats.isValid && stats.error && (
                    <div className="mb-2 p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 font-mono text-[11px] leading-relaxed">
                      <span className="font-bold">XML Parse Warning:</span> {stats.error}
                    </div>
                  )}

                  {/* Editor container with line numbers */}
                  <div className="relative flex-1 flex rounded-xl border border-border bg-[#0B0F19] text-slate-200 overflow-hidden min-h-[460px] font-mono text-[12px] leading-5">
                    {/* Line numbers gutter */}
                    <div className="select-none py-3 px-2 text-right text-slate-600 bg-[#070A12] border-r border-slate-800/80 min-w-[38px] overflow-hidden">
                      {Array.from({ length: Math.min(lineCount, 300) }, (_, i) => (
                        <div key={i + 1}>{i + 1}</div>
                      ))}
                      {lineCount > 300 && <div>...</div>}
                    </div>

                    {/* Textarea Code Input */}
                    <textarea
                      ref={textareaRef}
                      value={svgCode}
                      onChange={(e) => setSvgCode(e.target.value)}
                      placeholder="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>...</svg>"
                      spellCheck={false}
                      className="flex-1 p-3 bg-transparent text-slate-200 resize-none focus:outline-none font-mono text-[12px] leading-5 tab-2 overflow-y-auto selection:bg-accent/40"
                    />
                  </div>

                  {/* Editor Footer Status Bar */}
                  <div className="mt-2 px-2 flex items-center justify-between text-[11px] font-mono text-muted">
                    <div className="flex items-center gap-3">
                      <span>{lineCount} lines</span>
                      <span>·</span>
                      <span>{formatBytes(stats.byteSize)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSvgCode("");
                          setToastMsg("Cleared editor");
                        }}
                        className="text-muted hover:text-red-400 transition-colors"
                      >
                        Clear
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSvgCode(SAMPLE_SVGS[0].code);
                          setToastMsg("Reset to default mark");
                        }}
                        className="text-muted hover:text-accent transition-colors"
                      >
                        Reset Demo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COLOR PALETTE INSPECTOR & REPLACER */}
              {activeTab === "colors" && (
                <div className="p-4 space-y-5 flex-1 font-sans">
                  <div>
                    <h4 className="font-semibold text-text text-[13px]">Detected Color Palette</h4>
                    <p className="text-muted text-[12px] mt-0.5">
                      Colors found in <code>fill</code>, <code>stroke</code>, and gradients. Click any color to replace it globally in the SVG code.
                    </p>
                  </div>

                  {stats.colors.length === 0 ? (
                    <div className="p-8 text-center text-muted font-mono text-[12px] border border-dashed border-border rounded-xl">
                      No explicit HEX or RGB colors detected in this SVG (using currentColor or system default).
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {stats.colors.map((color) => {
                        const isSelected = selectedOldColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedOldColor(color)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${isSelected
                              ? "border-accent bg-accent/10 shadow-xs"
                              : "border-border bg-surface-muted/50 hover:border-accent/50"
                              }`}
                          >
                            <span
                              className="h-6 w-6 rounded-md border border-border/80 shadow-xs shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <div className="min-w-0">
                              <span className="block font-mono text-[11px] font-semibold text-text truncate">
                                {color}
                              </span>
                              <span className="block text-[10px] text-muted">Click to swap</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Color Replacement Panel */}
                  {selectedOldColor && (
                    <div className="p-4 rounded-xl border border-accent/30 bg-accent-subtle space-y-3 animate-fade-in font-mono text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="text-accent font-semibold">
                          Replace Selected Color ({selectedOldColor})
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedOldColor("")}
                          className="text-muted hover:text-text text-[11px]"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={replacementColor.startsWith("#") ? replacementColor : "#6366F1"}
                            onChange={(e) => setReplacementColor(e.target.value)}
                            className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0"
                          />
                          <input
                            type="text"
                            value={replacementColor}
                            onChange={(e) => setReplacementColor(e.target.value)}
                            className="h-8 w-28 rounded-lg border border-border bg-surface px-2.5 font-mono text-[11px] text-text"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleApplyColorReplace}
                          className="h-8 px-4 rounded-lg bg-accent text-white font-medium text-[11px] hover:bg-accent-strong transition-colors"
                        >
                          Apply Swap ↗
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXPORT & CODE INTEGRATION */}
              {activeTab === "export" && (
                <div className="p-4 space-y-5 flex-1 font-sans">
                  <div>
                    <h4 className="font-semibold text-text text-[13px]">Developer Integration & Snippets</h4>
                    <p className="text-muted text-[12px] mt-0.5">
                      Copy component code for your frontend framework or export in multiple raster formats.
                    </p>
                  </div>

                  <div className="space-y-3 font-mono text-[12px]">
                    {/* React JSX Snippet */}
                    <div className="p-3 rounded-xl border border-border bg-surface-muted/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text">React JSX / TSX Component</span>
                        <button
                          type="button"
                          onClick={handleCopyJsx}
                          className="h-7 px-3 rounded-md bg-accent text-white text-[11px] font-sans font-medium hover:bg-accent-strong transition-colors"
                        >
                          Copy JSX
                        </button>
                      </div>
                      <p className="text-[11px] font-sans text-muted">
                        Typed functional SVG component with props forwarding for Next.js, React, and Remix.
                      </p>
                    </div>

                    {/* Data URI Snippets */}
                    <div className="p-3 rounded-xl border border-border bg-surface-muted/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text">CSS / HTML Data URI</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyDataUri(false)}
                            className="h-7 px-2.5 rounded-md border border-border bg-surface hover:border-accent text-[11px] text-text transition-colors"
                          >
                            UTF-8 URI
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyDataUri(true)}
                            className="h-7 px-2.5 rounded-md border border-border bg-surface hover:border-accent text-[11px] text-text transition-colors"
                          >
                            Base64 URI
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] font-sans text-muted">
                        Ready to paste into <code>background-image: url(...)</code> or <code>&lt;img src="..."&gt;</code>.
                      </p>
                    </div>

                    {/* Raster Download Configuration */}
                    <div className="p-3 rounded-xl border border-border bg-surface-muted/40 space-y-3">
                      <span className="font-semibold text-text block">Raster Graphic Export</span>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                            Target Format
                          </label>
                          <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                            className="w-full h-8 rounded-lg border border-border bg-surface px-2 text-[11px] text-text"
                          >
                            <option value="svg">SVG Vector (.svg)</option>
                            <option value="png">PNG Image (.png)</option>
                            <option value="webp">WebP Modern (.webp)</option>
                            <option value="jpeg">JPEG Photo (.jpg)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                            Retina Scale Multiplier
                          </label>
                          <select
                            value={exportScale}
                            onChange={(e) => setExportScale(Number(e.target.value))}
                            disabled={exportFormat === "svg"}
                            className="w-full h-8 rounded-lg border border-border bg-surface px-2 text-[11px] text-text disabled:opacity-50"
                          >
                            <option value={1}>1x Standard ({stats.width}×{stats.height})</option>
                            <option value={2}>2x Retina ({stats.width * 2}×{stats.height * 2})</option>
                            <option value={3}>3x Ultra ({stats.width * 3}×{stats.height * 3})</option>
                            <option value={4}>4x Print ({stats.width * 4}×{stats.height * 4})</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isExporting || !stats.isValid}
                        className="w-full h-8 rounded-lg bg-text text-bg hover:opacity-90 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-50"
                      >
                        {isExporting ? "Rendering Raster..." : `Download as ${exportFormat.toUpperCase()}`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ==============================================================
                RIGHT COLUMN: LIVE INTERACTIVE SVG CANVAS VIEWER (7 cols)
            ============================================================== */}
            <div className="lg:col-span-6 flex flex-col rounded-2xl border border-border bg-surface shadow-card overflow-hidden min-h-[580px]">
              {/* Canvas Controls Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border bg-surface-muted/50 text-[11px] font-mono">
                {/* Background Toggles */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-muted mr-1 shrink-0">Backdrop:</span>
                  {(
                    [
                      { id: "checker", label: "Checkered", title: "Transparent grid" },
                      { id: "dark", label: "Dark", title: "Slate dark #0F172A" },
                      { id: "white", label: "White", title: "Clean white #FFF" },
                      { id: "black", label: "Black", title: "Pure black #000" },
                      { id: "custom", label: "Custom", title: "Custom solid color" },
                    ] as const
                  ).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBgMode(b.id)}
                      className={`px-2 py-0.5 rounded transition-all shrink-0 ${bgMode === b.id
                        ? "bg-accent text-white font-bold shadow-xs"
                        : "text-muted hover:text-text hover:bg-surface"
                        }`}
                      title={b.title}
                    >
                      {b.label}
                    </button>
                  ))}

                  {bgMode === "custom" && (
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="h-5 w-6 cursor-pointer rounded border border-border bg-transparent p-0 ml-1 shrink-0"
                      title="Pick custom backdrop color"
                    />
                  )}
                </div>

                {/* Zoom & Grid Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <button
                    type="button"
                    onClick={() => setShowGrid((prev) => !prev)}
                    className={`px-2 py-0.5 rounded border transition-colors ${showGrid
                      ? "border-accent text-accent bg-accent/10"
                      : "border-border text-muted hover:text-text"
                      }`}
                    title="Toggle alignment grid"
                  >
                    Grid
                  </button>

                  <div className="flex items-center border border-border rounded-md bg-surface overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(25, z - 25))}
                      className="px-2 py-0.5 text-muted hover:text-text hover:bg-surface-muted transition-colors"
                      title="Zoom Out"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 text-text font-semibold min-w-[42px] text-center">
                      {zoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(500, z + 25))}
                      className="px-2 py-0.5 text-muted hover:text-text hover:bg-surface-muted transition-colors"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoom(100)}
                      className="px-1.5 py-0.5 border-l border-border text-[10px] text-muted hover:text-accent"
                      title="Reset 100%"
                    >
                      1:1
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas Interactive Viewport */}
              <div
                className={`relative flex-1 min-h-[460px] p-6 flex items-center justify-center overflow-auto select-none transition-colors ${bgMode === "checker"
                  ? "bg-checkerboard"
                  : bgMode === "dark"
                    ? "bg-[#0F172A]"
                    : bgMode === "white"
                      ? "bg-[#FFFFFF]"
                      : bgMode === "black"
                        ? "bg-[#000000]"
                        : ""
                  }`}
                style={bgMode === "custom" ? { backgroundColor: customBgColor } : undefined}
              >
                {/* Optional Alignment Grid Lines */}
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                )}

                {/* SVG Render Element */}
                {stats.isValid ? (
                  <div
                    className="relative transition-transform duration-100 ease-out drop-shadow-md flex items-center justify-center"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                    suppressHydrationWarning
                  />
                ) : (
                  <div className="text-center p-8 max-w-sm rounded-xl border border-dashed border-rose-500/40 bg-surface/90 text-rose-400 font-mono text-[12px] space-y-2">
                    <p className="font-bold">Cannot Render Invalid SVG</p>
                    <p className="text-[11px] text-muted">
                      Please check the code editor for unclosed tags or syntax errors.
                    </p>
                  </div>
                )}
              </div>

              {/* Canvas Bottom Information Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-border bg-surface text-[11px] font-mono text-muted">
                <div className="flex items-center gap-2">
                  <span className="text-text font-semibold">
                    {stats.width} × {stats.height} px
                  </span>
                  {stats.viewBox && (
                    <span className="text-muted/80 bg-surface-muted px-1.5 py-0.2 rounded border border-border/60">
                      viewBox: {stats.viewBox}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span>{stats.pathCount} paths</span>
                  <span>·</span>
                  <span>{stats.elementCount} elements</span>
                  <span>·</span>
                  <span className="text-accent font-semibold">{formatBytes(stats.byteSize)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
