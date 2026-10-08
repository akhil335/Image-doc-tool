"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import ProgressBar from "@/components/ProgressBar";
import { pdfToImages, ImageFormat, RenderedPage } from "@/lib/pdfToImages";
import { formatBytes } from "@/lib/fileUtils";
import { saveAs } from "file-saver";
import JSZip from "jszip";

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [scale, setScale] = useState(2);
  const [pageSelection, setPageSelection] = useState<"all" | "first" | "custom">("all");
  const [customRange, setCustomRange] = useState<string>("");
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function addFile(files: File[]) {
    setError(null);
    setPages([]);
    const pdf = files[0];
    if (pdf.type !== "application/pdf" && !pdf.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a valid PDF document.");
      return;
    }
    setFile(pdf);
    setToastMsg(`Loaded PDF: ${pdf.name}`);
  }

  function parsePageRange(rangeStr: string): number[] | undefined {
    if (!rangeStr.trim()) return undefined;
    const pagesSet = new Set<number>();
    const parts = rangeStr.split(",");
    for (const part of parts) {
      const p = part.trim();
      if (p.includes("-")) {
        const [start, end] = p.split("-").map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i > 0) pagesSet.add(i);
          }
        }
      } else {
        const num = parseInt(p, 10);
        if (!isNaN(num) && num > 0) pagesSet.add(num);
      }
    }
    return pagesSet.size > 0 ? Array.from(pagesSet).sort((a, b) => a - b) : undefined;
  }

  async function handleConvert() {
    if (!file) return;
    setIsConverting(true);
    setError(null);
    setPages([]);

    let selectedPages: number[] | undefined;
    if (pageSelection === "first") {
      selectedPages = [1];
    } else if (pageSelection === "custom") {
      selectedPages = parsePageRange(customRange);
    }

    try {
      const results = await pdfToImages(
        file,
        format,
        scale,
        (done, total) => setProgress({ done, total }),
        selectedPages
      );
      setPages(results);
      setToastMsg(`Rendered ${results.length} page${results.length > 1 ? "s" : ""} successfully.`);
    } catch (e) {
      console.error(e);
      setError("Couldn't render that PDF. It may be password-protected or corrupted.");
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  }

  function downloadPage(page: RenderedPage) {
    const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";
    saveAs(page.blob, `page-${String(page.pageNumber).padStart(2, "0")}.${ext}`);
  }

  async function downloadAllZip() {
    const zip = new JSZip();
    const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";
    pages.forEach((page) => {
      zip.file(`page-${String(page.pageNumber).padStart(2, "0")}.${ext}`, page.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "docst.tech-pdf-pages.zip");
    setToastMsg("Downloaded all pages as ZIP.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="09 · Document"
            title="PDF → Image"
            description="Extract PDF pages into ultra-sharp PNG, JPG, or WebP images. Select specific page ranges, configure rendering resolution up to 300 DPI, and download individually or as a zip."
            badge="Studio Extractor"
          />

          {!file ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="application/pdf"
                onFiles={addFile}
                label="Drop a PDF here, or click to browse"
                hint="Single PDF document · 100% private in-browser rendering"
              />
              {error && (
                <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 font-mono text-[12px]">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              {error && (
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 font-mono text-[12px]">
                  {error}
                </div>
              )}

              {/* Extraction Configuration Card */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-mono text-[11px] font-bold">
                      PDF
                    </div>
                    <div>
                      <h3 className="font-semibold text-text text-[14px] truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </h3>
                      <p className="font-mono text-[11px] text-muted">Ready to render pages</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFile(null);
                      setPages([]);
                    }}
                    className="h-8 px-3 rounded-lg border border-border bg-bg text-muted hover:text-text text-[12px] font-medium transition-colors"
                  >
                    Change PDF
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Format */}
                  <div>
                    <label className="block text-[11px] font-mono text-muted mb-1.5">Output Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as ImageFormat)}
                      className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                    >
                      <option value="png">PNG · Sharp text & diagrams</option>
                      <option value="jpeg">JPG · Smaller photo file size</option>
                      <option value="webp">WebP · Modern compact format</option>
                    </select>
                  </div>

                  {/* Resolution DPI */}
                  <div>
                    <label className="block text-[11px] font-mono text-muted mb-1.5">Render Resolution</label>
                    <select
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                    >
                      <option value="1">1.0x · Standard Screen (72 DPI)</option>
                      <option value="1.5">1.5x · Crisp (108 DPI)</option>
                      <option value="2">2.0x · Retina HiDPI (144 DPI)</option>
                      <option value="3">3.0x · Ultra Print (216 DPI)</option>
                    </select>
                  </div>

                  {/* Pages Selection */}
                  <div>
                    <label className="block text-[11px] font-mono text-muted mb-1.5">Pages to Extract</label>
                    <select
                      value={pageSelection}
                      onChange={(e) => setPageSelection(e.target.value as "all" | "first" | "custom")}
                      className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                    >
                      <option value="all">All Pages</option>
                      <option value="first">First Page Only (Cover)</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                </div>

                {pageSelection === "custom" && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-mono text-muted mb-1">
                      Specify Page Numbers (e.g. 1-3, 5, 8-10)
                    </label>
                    <input
                      type="text"
                      value={customRange}
                      onChange={(e) => setCustomRange(e.target.value)}
                      placeholder="1-5, 8"
                      className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-border flex justify-end">
                  <button
                    onClick={handleConvert}
                    disabled={isConverting}
                    className="h-10 px-6 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isConverting ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Rendering pages…</span>
                      </>
                    ) : (
                      <span>Render PDF Pages</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Feedback */}
              {isConverting && progress && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <ProgressBar
                    progress={Math.round((progress.done / progress.total) * 100)}
                    label={`Rendering page ${progress.done} of ${progress.total}...`}
                    subtext={`${progress.done} / ${progress.total}`}
                  />
                </div>
              )}

              {/* Rendered Pages Gallery */}
              {pages.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text text-[14px]">Extracted Pages</span>
                      <span className="rounded-full bg-accent/10 text-accent font-mono text-[10px] px-2 py-0.5">
                        {pages.length} pages
                      </span>
                    </div>

                    <button
                      onClick={downloadAllZip}
                      className="h-8 px-4 rounded-lg bg-accent text-white hover:bg-accent-strong text-[12px] font-medium transition-colors shadow-xs"
                    >
                      Download All as ZIP
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((p) => (
                      <div
                        key={p.pageNumber}
                        className="rounded-lg border border-border bg-bg/50 p-3 flex flex-col justify-between hover:border-accent hover:bg-surface transition-all group"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[11px] font-mono">
                          <span className="text-text font-medium">Page {p.pageNumber}</span>
                          <span className="text-muted">{formatBytes(p.blob.size)}</span>
                        </div>

                        <div className="relative flex items-center justify-center bg-black/30 rounded p-2 overflow-hidden min-h-[160px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.dataUrl}
                            alt={`Page ${p.pageNumber}`}
                            className="max-h-[180px] max-w-full object-contain rounded shadow"
                          />
                        </div>

                        <button
                          onClick={() => downloadPage(p)}
                          className="mt-3 w-full h-8 rounded-md border border-border bg-bg text-text hover:border-accent hover:text-accent text-[11px] font-mono transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Download Page {p.pageNumber}</span>
                          <span>↓</span>
                        </button>
                      </div>
                    ))}
                  </div>
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
