"use client";

import { useState } from "react";
import { imagesToPdf, PageSize, PageOrientation } from "@/lib/imageToPdf";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { saveAs } from "file-saver";

interface QueuedImage {
  file: File;
  previewUrl: string;
  id: string;
}

export default function ImageToPdfPage() {
  const [queue, setQueue] = useState<QueuedImage[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [orientation, setOrientation] = useState<PageOrientation>("auto");
  const [margin, setMargin] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function addFiles(files: File[]) {
    setError(null);
    const valid = files.filter((f) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(f.type) ||
      f.name.match(/\.(jpe?g|png)$/i)
    );
    if (valid.length !== files.length) {
      setError("Only JPG and PNG images are supported for PDF compilation — skipped other formats.");
    }
    const items = valid.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    }));
    setQueue((prev) => [...prev, ...items]);
    setToastMsg(`Added ${items.length} image${items.length > 1 ? "s" : ""} to document.`);
  }

  function remove(id: string) {
    setQueue((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function move(id: string, dir: -1 | 1) {
    setQueue((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      const target = idx + dir;
      if (idx === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function clearAll() {
    queue.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setQueue([]);
  }

  async function handleConvert() {
    if (!queue.length) return;
    setIsConverting(true);
    setError(null);
    try {
      const bytes = await imagesToPdf(
        queue.map((item) => item.file),
        pageSize,
        orientation,
        margin
      );
      const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
      saveAs(blob, "docst.tech-compiled-document.pdf");
      setToastMsg("PDF compiled and downloaded successfully!");
    } catch (e) {
      console.error(e);
      setError("Could not compile document. Check file compatibility.");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="08 · Document"
            title="Image → PDF"
            description="Bundle JPG and PNG images into a clean, searchable PDF document. Reorder pages, select standard paper sizes (A4, Letter, Legal), control orientation, and set margins."
            badge="Studio Compiler"
          />

          {queue.length === 0 ? (
            <div className="mt-8 max-w-2xl mx-auto">
              <Dropzone
                accept="image/png,image/jpeg"
                multiple
                onFiles={addFiles}
                label="Drop images to compile into PDF, or click to browse"
                hint="PNG · JPG · Multiple files supported · 100% private in-browser"
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

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Document Pages Queue (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                    {/* Header */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-surface/50 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">Pages Queue</span>
                        <span className="rounded-full bg-accent/10 text-accent font-mono text-[10px] px-2 py-0.5">
                          {queue.length} pages
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer text-[11px] text-accent hover:underline">
                          + Add more
                          <input
                            type="file"
                            accept="image/png,image/jpeg"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) addFiles(Array.from(e.target.files));
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

                    {/* Page List */}
                    <ul className="divide-y divide-border/60 max-h-[520px] overflow-y-auto">
                      {queue.map((item, idx) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-3.5 hover:bg-bg/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-[11px] text-muted/60 w-6">
                              #{String(idx + 1).padStart(2, "0")}
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.previewUrl}
                              alt=""
                              className="h-12 w-12 rounded object-cover border border-border shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-medium text-text max-w-[130px] xs:max-w-[200px] sm:max-w-none">
                                {item.file.name}
                              </p>
                              <p className="font-mono text-[10px] text-muted">
                                Page {idx + 1} of {queue.length}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => move(item.id, -1)}
                              disabled={idx === 0}
                              className="h-7 w-7 rounded-md border border-border bg-bg text-muted hover:text-text hover:border-accent disabled:opacity-30 text-[11px] flex items-center justify-center transition-colors"
                              title="Move page up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => move(item.id, 1)}
                              disabled={idx === queue.length - 1}
                              className="h-7 w-7 rounded-md border border-border bg-bg text-muted hover:text-text hover:border-accent disabled:opacity-30 text-[11px] flex items-center justify-center transition-colors"
                              title="Move page down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(item.id)}
                              className="h-7 w-7 rounded-md border border-border bg-bg text-muted hover:text-red-400 hover:border-red-400/50 text-[11px] flex items-center justify-center transition-colors ml-1"
                              title="Remove page"
                            >
                              ✕
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Document Inspector (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M4 1.75C4 .784 4.784 0 5.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 14.25 16h-8.5A1.75 1.75 0 0 1 4 14.25V1.75Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V4.75h-2.75A1.75 1.75 0 0 1 10 3V1.5H5.75Zm5.75.56V3a.25.25 0 0 0 .25.25h1.19L11.5 2.06Z"/>
                        </svg>
                        <h3 className="text-[13px] font-semibold text-text">PDF Document Setup</h3>
                      </div>
                      <span className="font-mono text-[11px] text-accent font-semibold">{queue.length} Pages</span>
                    </div>

                    {/* Page Size */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">Page Dimensions</label>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as PageSize)}
                        className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="fit">Fit to Image · Match each photo</option>
                        <option value="a4">A4 · Standard International (210 × 297 mm)</option>
                        <option value="letter">US Letter · Standard US (8.5 × 11 in)</option>
                        <option value="legal">US Legal · Extended (8.5 × 14 in)</option>
                      </select>
                    </div>

                    {/* Page Orientation */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">Orientation</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "auto", label: "Auto Detect" },
                          { id: "portrait", label: "Portrait" },
                          { id: "landscape", label: "Landscape" },
                        ].map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setOrientation(o.id as PageOrientation)}
                            className={`h-8 rounded-lg border px-2 text-[11px] font-mono transition-all ${
                              orientation === o.id
                                ? "border-accent bg-accent/10 text-accent font-semibold"
                                : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Margins */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">Page Margins</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { val: 0, label: "0 pt (Flush)" },
                          { val: 10, label: "10 pt (Slim)" },
                          { val: 20, label: "20 pt (Standard)" },
                        ].map((m) => (
                          <button
                            key={m.val}
                            type="button"
                            onClick={() => setMargin(m.val)}
                            className={`h-8 rounded-lg border px-2 text-[11px] font-mono transition-all ${
                              margin === m.val
                                ? "border-accent bg-accent/10 text-accent font-semibold"
                                : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Compile Action */}
                    <div className="pt-3 border-t border-border">
                      <button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="w-full h-10 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        {isConverting ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Compiling PDF document…</span>
                          </>
                        ) : (
                          <>
                            <span>Compile & Download PDF</span>
                            <span className="text-[11px] font-mono opacity-80">({queue.length} pages)</span>
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