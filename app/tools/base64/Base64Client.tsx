"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { formatBytes, readFileAsDataURL } from "@/lib/fileUtils";
import { dataUrlToBlob } from "@/lib/canvasUtils";
import { saveAs } from "file-saver";

export default function Base64Client() {
  const [tab, setTab] = useState<"encode" | "decode">("encode");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Encode state
  const [encodedFile, setEncodedFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState<string>("");
  const [rawBase64, setRawBase64] = useState<string>("");

  // Decode state
  const [decodeInput, setDecodeInput] = useState<string>("");
  const [decodedMime, setDecodedMime] = useState<string>("image/png");
  const [decodedUrl, setDecodedUrl] = useState<string>("");
  const [decodedSize, setDecodedSize] = useState<number>(0);

  async function handleEncodeFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setEncodedFile(f);
    try {
      const uri = await readFileAsDataURL(f);
      setDataUri(uri);
      const raw = uri.split(",")[1] || "";
      setRawBase64(raw);
      setToastMsg(`Encoded ${f.name} into Base64.`);
    } catch {
      setToastMsg("Could not encode file.");
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setToastMsg(`Copied ${label} to clipboard!`);
  }

  function handleDecode() {
    if (!decodeInput.trim()) return;

    let fullUri = decodeInput.trim();
    if (!fullUri.startsWith("data:image/")) {
      let detectedType = "image/png";
      if (fullUri.startsWith("/9j/")) detectedType = "image/jpeg";
      else if (fullUri.startsWith("iVBORw0KGgo")) detectedType = "image/png";
      else if (fullUri.startsWith("R0lGOD")) detectedType = "image/gif";
      else if (fullUri.startsWith("UklGR")) detectedType = "image/webp";
      else if (fullUri.startsWith("PHN2Zy") || fullUri.startsWith("PD94bWw")) detectedType = "image/svg+xml";

      fullUri = `data:${detectedType};base64,${fullUri}`;
      setDecodedMime(detectedType);
    } else {
      const match = fullUri.match(/^data:([^;]+);/);
      if (match) setDecodedMime(match[1]);
    }

    try {
      const blob = dataUrlToBlob(fullUri);
      const url = URL.createObjectURL(blob);
      setDecodedUrl(url);
      setDecodedSize(blob.size);
      setToastMsg("Decoded Base64 string into image!");
    } catch (err) {
      console.error(err);
      setToastMsg("Invalid Base64 string or image format.");
    }
  }

  function downloadDecoded() {
    if (!decodedUrl) return;
    try {
      const blob = dataUrlToBlob(decodedUrl.startsWith("data:") ? decodedUrl : decodeInput.trim());
      const ext = decodedMime.split("/")[1] || "png";
      saveAs(blob, `decoded-image.${ext}`);
      setToastMsg("Downloaded decoded image.");
    } catch {
      setToastMsg("Download failed.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="12 · Code"
            title="Base64 Image Studio"
            description="Convert raster or vector images into Base64 Data URIs, HTML image tags, and CSS snippets for inline embedding, or decode raw Base64 data back into original image binaries."
            badge="Developer Tool"
          />

          {/* Segmented Mode Navigation */}
          <div className="mt-8 flex justify-center">
            <div className="flex rounded-xl border border-border bg-surface p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setTab("encode")}
                className={`flex items-center gap-2 px-5 py-2 text-[12px] font-medium rounded-lg transition-all ${
                  tab === "encode"
                    ? "bg-accent text-white shadow-xs"
                    : "text-muted hover:text-text"
                }`}
              >
                <span>Image → Base64</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("decode")}
                className={`flex items-center gap-2 px-5 py-2 text-[12px] font-medium rounded-lg transition-all ${
                  tab === "decode"
                    ? "bg-accent text-white shadow-xs"
                    : "text-muted hover:text-text"
                }`}
              >
                <span>Base64 → Image</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ENCODE */}
          {tab === "encode" && (
            <div className="mt-8 animate-fade-in space-y-6">
              {!encodedFile ? (
                <div className="max-w-2xl mx-auto">
                  <Dropzone
                    accept="image/*"
                    multiple={false}
                    onFiles={handleEncodeFile}
                    label="Drop an image to encode, or click to browse"
                    hint="PNG · JPG · WebP · SVG · GIF · ICO · Any image file"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Image Info Preview Card (4 cols) */}
                  <div className="lg:col-span-4 rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <h3 className="text-[13px] font-semibold text-text">Source Image</h3>
                      <button
                        onClick={() => {
                          setEncodedFile(null);
                          setDataUri("");
                          setRawBase64("");
                        }}
                        className="text-[11px] font-mono text-muted hover:text-red-400 transition-colors"
                      >
                        Change
                      </button>
                    </div>

                    <div className="rounded-lg bg-black/40 p-4 flex items-center justify-center pattern-dots overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dataUri}
                        alt="Encoded"
                        className="max-h-[180px] max-w-full object-contain rounded"
                      />
                    </div>

                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted">Filename:</span>
                        <span className="text-text font-medium truncate max-w-[150px]">{encodedFile.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Original Size:</span>
                        <span className="text-text">{formatBytes(encodedFile.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Base64 Size:</span>
                        <span className="text-accent">{formatBytes(rawBase64.length)} (+33%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Code Snippets (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Data URI */}
                    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-text">Data URI</span>
                        <button
                          onClick={() => copy(dataUri, "Data URI")}
                          className="h-7 px-2.5 rounded-md border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-[11px] font-mono transition-colors"
                        >
                          Copy URI
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-bg border border-border text-[11px] font-mono text-muted overflow-x-auto max-h-24">
                        {dataUri.slice(0, 180)}…
                      </pre>
                    </div>

                    {/* Raw Base64 */}
                    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-text">Raw Base64 String</span>
                        <button
                          onClick={() => copy(rawBase64, "Raw Base64")}
                          className="h-7 px-2.5 rounded-md border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-[11px] font-mono transition-colors"
                        >
                          Copy Raw String
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-bg border border-border text-[11px] font-mono text-muted overflow-x-auto max-h-24">
                        {rawBase64.slice(0, 180)}…
                      </pre>
                    </div>

                    {/* HTML Image Tag */}
                    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-text">HTML `&lt;img&gt;` Tag</span>
                        <button
                          onClick={() => copy(`<img src="${dataUri}" alt="${encodedFile.name}" />`, "HTML <img> tag")}
                          className="h-7 px-2.5 rounded-md border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-[11px] font-mono transition-colors"
                        >
                          Copy HTML
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-bg border border-border text-[11px] font-mono text-muted overflow-x-auto">
                        {`<img src="${dataUri.slice(0, 80)}…" alt="${encodedFile.name}" />`}
                      </pre>
                    </div>

                    {/* CSS Background */}
                    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-text">CSS Background</span>
                        <button
                          onClick={() => copy(`background-image: url("${dataUri}");`, "CSS snippet")}
                          className="h-7 px-2.5 rounded-md border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-[11px] font-mono transition-colors"
                        >
                          Copy CSS
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-bg border border-border text-[11px] font-mono text-muted overflow-x-auto">
                        {`background-image: url("${dataUri.slice(0, 80)}…");`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DECODE */}
          {tab === "decode" && (
            <div className="mt-8 animate-fade-in space-y-6 max-w-3xl mx-auto">
              <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-[13px] font-semibold text-text">Paste Base64 or Data URI</h3>
                  <button
                    onClick={() => {
                      setDecodeInput("");
                      setDecodedUrl("");
                    }}
                    className="text-[11px] font-mono text-muted hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                <textarea
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                  placeholder="Paste your base64 string here (e.g. data:image/png;base64,iVBORw0KGgo... or raw /9j/4AAQSkZJR...)"
                  rows={6}
                  className="w-full rounded-lg border border-border bg-bg p-3 font-mono text-[11px] text-text focus:border-accent focus:outline-none transition-colors"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleDecode}
                    disabled={!decodeInput.trim()}
                    className="h-9 px-5 rounded-lg bg-accent text-white font-medium text-[12px] hover:bg-accent-strong disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    Decode Base64
                  </button>
                </div>
              </div>

              {decodedUrl && (
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <h3 className="text-[13px] font-semibold text-text">Decoded Image Result</h3>
                    </div>
                    <span className="font-mono text-[11px] text-muted">
                      {decodedMime} · {formatBytes(decodedSize)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-black/40 p-6 flex items-center justify-center pattern-dots overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={decodedUrl}
                      alt="Decoded"
                      className="max-h-[300px] max-w-full object-contain rounded shadow"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={downloadDecoded}
                      className="h-9 px-5 rounded-lg bg-accent text-white font-medium text-[12px] hover:bg-accent-strong transition-colors shadow-xs cursor-pointer"
                    >
                      Download Image Binary
                    </button>
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
