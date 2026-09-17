"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import { pdfToImages, ImageFormat, RenderedPage } from "@/lib/pdfToImages";
import { saveAs } from "file-saver";
import JSZip from "jszip";

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [scale, setScale] = useState(2);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addFile(files: File[]) {
    setError(null);
    setPages([]);
    const pdf = files[0];
    if (pdf.type !== "application/pdf" && !pdf.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    setFile(pdf);
  }

  async function handleConvert() {
    if (!file) return;
    setIsConverting(true);
    setError(null);
    setPages([]);
    try {
      const results = await pdfToImages(file, format, scale, (done, total) =>
        setProgress({ done, total })
      );
      setPages(results);
    } catch (e) {
      console.error(e);
      setError("Couldn't read that PDF. It may be encrypted or corrupted.");
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  }

  function downloadPage(page: RenderedPage) {
    const ext = format === "png" ? "png" : "jpg";
    saveAs(page.blob, `page-${String(page.pageNumber).padStart(2, "0")}.${ext}`);
  }

  async function downloadAllZip() {
    const zip = new JSZip();
    const ext = format === "png" ? "png" : "jpg";
    pages.forEach((page) => {
      zip.file(`page-${String(page.pageNumber).padStart(2, "0")}.${ext}`, page.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "docforge-pages.zip");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="font-mono text-[12px] text-accent">02 · pdf → image</p>
          <h1 className="mt-3 font-display text-4xl text-text">
            Turn PDF pages into images
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
            Upload a PDF and export every page as a PNG or JPG, either one at
            a time or as a zip.
          </p>

          <div className="mt-10">
            <Dropzone
              accept="application/pdf"
              onFiles={addFile}
              label={file ? file.name : "Drop a PDF here, or click to browse"}
              hint="Single PDF file"
            />
          </div>

          {error && (
            <p className="mt-4 font-mono text-[12px] text-danger">{error}</p>
          )}

          {file && (
            <div className="mt-8 tray-in">
              <div className="flex flex-wrap items-center gap-4 font-mono text-[12px] text-muted">
                <div className="flex items-center gap-2">
                  <label>format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ImageFormat)}
                    className="focus-ring rounded-sm border border-border bg-surface px-2 py-1 text-text"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPG</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label>quality</label>
                  <select
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="focus-ring rounded-sm border border-border bg-surface px-2 py-1 text-text"
                  >
                    <option value={1}>standard</option>
                    <option value={2}>high</option>
                    <option value={3}>very high</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="focus-ring mt-6 w-full rounded-sm bg-accent py-3 font-mono text-[13px] text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
              >
                {isConverting
                  ? progress
                    ? `rendering page ${progress.done} of ${progress.total}…`
                    : "reading pdf…"
                  : "convert to images"}
              </button>
            </div>
          )}

          {pages.length > 0 && (
            <div className="mt-10 tray-in">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[12px] text-muted">
                  {pages.length} page{pages.length > 1 ? "s" : ""} ready
                </p>
                {pages.length > 1 && (
                  <button
                    onClick={downloadAllZip}
                    className="focus-ring font-mono text-[12px] text-accent hover:text-accent-strong"
                  >
                    download all as .zip
                  </button>
                )}
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {pages.map((page) => (
                  <li
                    key={page.pageNumber}
                    className="group relative overflow-hidden rounded-sm border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <button
                      onClick={() => downloadPage(page)}
                      className="focus-ring absolute inset-x-0 bottom-0 bg-surface/95 py-1.5 font-mono text-[11px] text-text opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      page {page.pageNumber} · download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
