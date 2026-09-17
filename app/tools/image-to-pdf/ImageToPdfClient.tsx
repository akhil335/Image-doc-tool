'use client'

import { useState } from "react";
import { imagesToPdf, PageSize } from "@/lib/imageToPdf";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import { saveAs } from "file-saver";

interface QueuedImage {
  file: File;
  previewUrl: string;
  id: string;
}


export default function ImageToPdfPage() {
  const [queue, setQueue] = useState<QueuedImage[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: File[]) {
    setError(null);
    const valid = files.filter((f) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(f.type)
    );
    if (valid.length !== files.length) {
      setError("Only JPG and PNG images are supported — skipped anything else.");
    }
    const items = valid.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    }));
    setQueue((prev) => [...prev, ...items]);
  }

  function remove(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
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

  async function handleConvert() {
    if (!queue.length) return;
    setIsConverting(true);
    setError(null);
    try {
      const bytes = await imagesToPdf(
        queue.map((item) => item.file),
        pageSize
      );
      const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
      saveAs(blob, "docforge-images.pdf");
    } catch (e) {
      console.error(e);
      setError("Something went wrong converting these images. Try a different file.");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="font-mono text-[12px] text-accent">01 · image → pdf</p>
          <h1 className="mt-3 font-display text-4xl text-text">
            Bundle images into a PDF
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
            Add JPGs or PNGs, put them in order, and export one PDF with each
            image as its own page.
          </p>

          <div className="mt-10">
            <Dropzone
              accept="image/png,image/jpeg"
              multiple
              onFiles={addFiles}
              label="Drop images here, or click to browse"
              hint="JPG or PNG · multiple files supported"
            />
          </div>

          {error && (
            <p className="mt-4 font-mono text-[12px] text-danger">{error}</p>
          )}

          {queue.length > 0 && (
            <div className="mt-8 tray-in">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[12px] text-muted">
                  {queue.length} file{queue.length > 1 ? "s" : ""} queued
                </p>
                <div className="flex items-center gap-2 font-mono text-[12px]">
                  <label className="text-muted">page size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PageSize)}
                    className="focus-ring rounded-sm border border-border bg-surface px-2 py-1 text-text"
                  >
                    <option value="fit">fit to image</option>
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-border rounded-sm border border-border">
                {queue.map((item, idx) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <span className="font-mono text-[11px] text-muted/60 w-5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-12 w-12 rounded-sm object-cover"
                    />
                    <span className="flex-1 truncate text-[13px] text-text">
                      {item.file.name}
                    </span>
                    <div className="flex items-center gap-1 font-mono text-[12px] text-muted">
                      <button
                        onClick={() => move(item.id, -1)}
                        disabled={idx === 0}
                        className="focus-ring rounded-sm px-2 py-1 hover:text-text disabled:opacity-20"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(item.id, 1)}
                        disabled={idx === queue.length - 1}
                        className="focus-ring rounded-sm px-2 py-1 hover:text-text disabled:opacity-20"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="focus-ring rounded-sm px-2 py-1 hover:text-danger"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="focus-ring mt-6 w-full rounded-sm bg-accent py-3 font-mono text-[13px] text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
              >
                {isConverting ? "converting…" : "convert to pdf"}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}