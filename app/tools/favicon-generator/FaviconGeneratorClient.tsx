"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dropzone from "@/components/Dropzone";
import ToolHeader from "@/components/ToolHeader";
import Toast from "@/components/Toast";
import { formatBytes, getFileNameWithoutExtension, loadImage } from "@/lib/fileUtils";
import {
  generateFaviconSuite,
  FaviconVariant,
  FaviconOptions,
} from "@/lib/faviconUtils";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const SAMPLE_LOGO = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&q=90&auto=format&fit=crop";

export default function FaviconGeneratorClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [options, setOptions] = useState<FaviconOptions>({
    shape: "square",
    paddingPercent: 5,
    backgroundColor: "transparent",
    appName: "My Website",
    themeColor: "#ff4d00",
  });

  const [previewTab, setPreviewTab] = useState<"browser" | "mobile" | "search" | "grid">("browser");
  const [variants, setVariants] = useState<FaviconVariant[]>([]);
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null);
  const [manifestJson, setManifestJson] = useState<string>("");
  const [htmlSnippet, setHtmlSnippet] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const regenerate = useCallback(async (sourceUrl: string, opts: FaviconOptions) => {
    if (!sourceUrl) return;
    setIsGenerating(true);
    try {
      const suite = await generateFaviconSuite(sourceUrl, opts);
      setVariants(suite.variants);
      setIcoBlob(suite.icoBlob);
      setManifestJson(suite.manifestJson);
      setHtmlSnippet(suite.htmlSnippet);
    } catch (err) {
      console.error(err);
      setToastMsg("Could not generate favicons from this image.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setImgUrl(url);

    const baseName = getFileNameWithoutExtension(f.name);
    const newOpts: FaviconOptions = {
      ...options,
      appName: baseName.charAt(0).toUpperCase() + baseName.slice(1),
    };
    setOptions(newOpts);
    regenerate(url, newOpts);
    setToastMsg(`Loaded ${f.name} into Favicon Studio`);
  }

  function handleLoadSample() {
    setFile(null);
    setImgUrl(SAMPLE_LOGO);
    const sampleOpts: FaviconOptions = {
      ...options,
      appName: "DocForge Studio",
      paddingPercent: 8,
    };
    setOptions(sampleOpts);
    regenerate(SAMPLE_LOGO, sampleOpts);
    setToastMsg("Loaded sample studio logo.");
  }

  // Debounced regeneration on options update
  useEffect(() => {
    if (!imgUrl) return;
    const timer = setTimeout(() => {
      regenerate(imgUrl, options);
    }, 180);
    return () => clearTimeout(timer);
  }, [imgUrl, options, regenerate]);

  function copyHtml() {
    navigator.clipboard.writeText(htmlSnippet);
    setToastMsg("Copied favicon HTML tags to clipboard!");
  }

  function downloadVariant(v: FaviconVariant) {
    saveAs(v.blob, v.fileName);
    setToastMsg(`Downloaded ${v.fileName}`);
  }

  function downloadIco() {
    if (!icoBlob) return;
    saveAs(icoBlob, "favicon.ico");
    setToastMsg("Downloaded favicon.ico (16x16, 32x32, 48x48)");
  }

  async function downloadFullZip() {
    if (!variants.length || !icoBlob) return;
    setIsGenerating(true);
    try {
      const zip = new JSZip();

      // 1. Add favicon.ico
      zip.file("favicon.ico", icoBlob);

      // 2. Add all PNG sizes
      for (const v of variants) {
        zip.file(v.fileName, v.blob);
      }

      // 3. Add Webmanifest
      zip.file("site.webmanifest", manifestJson);

      // 4. Add HTML instructions
      const readme = `DOCFORGE FAVICON PACKAGE
========================
Generated for: ${options.appName}

INSTRUCTIONS:
1. Place all icon files and 'site.webmanifest' in your website's root public directory (e.g. /public or /html).
2. Copy and paste the following HTML tags into your website's <head> section:

${htmlSnippet}
`;
      zip.file("README.txt", readme);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${options.appName.toLowerCase().replace(/\s+/g, "-")}-favicons.zip`);
      setToastMsg("Downloaded complete favicon ZIP package!");
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to bundle ZIP archive.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Pick 32px or 180px for mockups
  const preview32 = variants.find((v) => v.width === 32)?.dataUrl || imgUrl;
  const preview180 = variants.find((v) => v.width === 180)?.dataUrl || imgUrl;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
          <ToolHeader
            tag="14 · Asset Studio"
            title="Favicon Generator"
            description="Generate complete, production-ready favicon packages from any image. Includes multi-size favicon.ico, Apple touch icons, Android PWA manifests, HTML tags, and clean ZIP export."
            badge="Studio Generator"
          />

          {!imgUrl ? (
            <div className="mt-8 max-w-2xl mx-auto space-y-4">
              <Dropzone
                accept="image/*,.ico,.svg"
                multiple={false}
                onFiles={handleFile}
                label="Drop logo or image to generate favicons, or browse"
                hint="PNG · SVG · JPG · WebP · Transparent background recommended"
              />

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="h-8 px-4 rounded-lg border border-border bg-surface hover:border-accent hover:text-accent font-mono text-[11px] text-muted transition-colors shadow-xs"
                >
                  ⚡ Or load sample abstract logo
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 animate-fade-in space-y-6">
              {/* Main Studio 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Interactive Mockups & Icon Gallery (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                    {/* Viewport Header with Mockup Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/80 bg-surface-muted/60 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="font-semibold text-text text-[13px]">
                          Live Mockup Preview
                        </span>
                      </div>

                      {/* Mockup Tabs */}
                      <div className="flex rounded-md border border-border p-0.5 bg-bg overflow-x-auto max-w-full scrollbar-none">
                        {(
                          [
                            { id: "browser", label: "Browser Tab" },
                            { id: "mobile", label: "Mobile App" },
                            { id: "search", label: "Google SERP" },
                            { id: "grid", label: "All Sizes (7)" },
                          ] as const
                        ).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setPreviewTab(t.id)}
                            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-mono rounded transition-colors shrink-0 ${
                              previewTab === t.id
                                ? "bg-accent text-white font-medium"
                                : "text-muted hover:text-text"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stage Body */}
                    <div className="p-6 bg-black/30 pattern-dots min-h-[360px] flex items-center justify-center">
                      {/* 1. MOCK BROWSER TAB PREVIEW */}
                      {previewTab === "browser" && (
                        <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl overflow-hidden animate-fade-in">
                          {/* Browser Window Chrome */}
                          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface-muted/80">
                            <div className="flex gap-1.5">
                              <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                            </div>

                            {/* Active Tab */}
                            <div className="ml-2 flex items-center gap-2 rounded-t-lg bg-surface px-3 py-1.5 border-t border-x border-border shadow-xs max-w-[200px] truncate">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={preview32}
                                alt="Favicon preview"
                                className="h-4 w-4 shrink-0 rounded-xs"
                              />
                              <span className="font-sans text-[12px] font-medium text-text truncate">
                                {options.appName || "My Website"}
                              </span>
                              <span className="text-[10px] text-muted ml-auto">✕</span>
                            </div>
                          </div>

                          {/* Mock Address Bar */}
                          <div className="p-3 bg-surface border-b border-border/40 flex items-center gap-2">
                            <div className="flex items-center gap-2 w-full rounded-md border border-border bg-bg px-2.5 py-1 font-mono text-[11px] text-muted">
                              <span className="text-emerald-500">🔒</span>
                              <span className="text-text">https://{options.appName.toLowerCase().replace(/\s+/g, "")}.com</span>
                            </div>
                          </div>

                          {/* Webpage Content Teaser */}
                          <div className="p-8 text-center bg-bg/50">
                            <p className="text-[12px] text-muted font-mono">
                              The 16×16 and 32×32 favicon renders crisply in all major browsers.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 2. MOCK MOBILE APP PREVIEW */}
                      {previewTab === "mobile" && (
                        <div className="w-64 rounded-3xl border-4 border-zinc-700 bg-zinc-900 shadow-2xl p-4 text-center animate-fade-in relative overflow-hidden">
                          {/* Notch */}
                          <div className="h-4 w-28 mx-auto bg-black rounded-b-xl mb-6" />

                          {/* App Icon Grid */}
                          <div className="flex flex-col items-center justify-center my-6 space-y-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview180}
                              alt="Apple touch icon"
                              className="h-20 w-20 rounded-2xl shadow-xl border border-white/20 transition-transform hover:scale-105"
                            />
                            <span className="font-sans text-[12px] font-medium text-white truncate max-w-[120px]">
                              {options.appName}
                            </span>
                          </div>

                          {/* Dock indicator */}
                          <div className="mt-8 pt-4 border-t border-white/10 flex justify-center gap-4 opacity-50">
                            <div className="h-8 w-8 rounded-lg bg-white/20" />
                            <div className="h-8 w-8 rounded-lg bg-white/20" />
                            <div className="h-8 w-8 rounded-lg bg-white/20" />
                          </div>
                        </div>
                      )}

                      {/* 3. MOCK GOOGLE SEARCH PREVIEW */}
                      {previewTab === "search" && (
                        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-4 shadow-md space-y-1.5 animate-fade-in text-left">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview32}
                              alt=""
                              className="h-5 w-5 rounded-full border border-border"
                            />
                            <div>
                              <p className="font-sans text-[12px] font-medium text-text leading-none">
                                {options.appName}
                              </p>
                              <p className="font-mono text-[10px] text-muted leading-none mt-0.5">
                                https://www.{options.appName.toLowerCase().replace(/\s+/g, "")}.com
                              </p>
                            </div>
                          </div>
                          <h4 className="font-sans text-[15px] font-medium text-blue-500 hover:underline cursor-pointer">
                            {options.appName} — Official Website & Documentation
                          </h4>
                          <p className="text-[12px] text-muted line-clamp-2">
                            Modern high-performance web platform. All security certificates and high-resolution favicon verified for search indexing.
                          </p>
                        </div>
                      )}

                      {/* 4. ALL ICON SIZES MATRIX */}
                      {previewTab === "grid" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full animate-fade-in max-h-[380px] overflow-y-auto p-1">
                          {/* favicon.ico card */}
                          <div className="rounded-lg border border-border bg-surface p-3 flex flex-col justify-between hover:border-accent transition-colors">
                            <div className="flex items-center justify-between font-mono text-[11px] mb-2">
                              <span className="font-bold text-accent">favicon.ico</span>
                              <span className="text-muted">Multi</span>
                            </div>
                            <div className="h-16 flex items-center justify-center bg-bg/50 rounded mb-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={preview32} alt="ICO" className="h-8 w-8 object-contain" />
                            </div>
                            <button
                              onClick={downloadIco}
                              className="w-full h-7 rounded border border-border bg-bg text-text hover:border-accent hover:text-accent font-mono text-[10px] transition-colors"
                            >
                              Download ICO
                            </button>
                          </div>

                          {/* PNG variants */}
                          {variants.map((v) => (
                            <div
                              key={v.fileName}
                              className="rounded-lg border border-border bg-surface p-3 flex flex-col justify-between hover:border-accent transition-colors"
                            >
                              <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                                <span className="font-medium text-text truncate max-w-[100px]">{v.fileName}</span>
                                <span className="text-muted">{v.width}px</span>
                              </div>
                              <div className="h-16 flex items-center justify-center bg-bg/50 rounded mb-2 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={v.dataUrl}
                                  alt={v.fileName}
                                  className="max-h-12 max-w-12 object-contain"
                                />
                              </div>
                              <button
                                onClick={() => downloadVariant(v)}
                                className="w-full h-7 rounded border border-border bg-bg text-text hover:border-accent hover:text-accent font-mono text-[10px] transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HTML Head Tag Snippet Card */}
                  <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-[13px] text-text">
                        HTML &lt;head&gt; Integration Tags
                      </span>
                      <button
                        onClick={copyHtml}
                        className="h-7 px-2.5 rounded-md border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-[11px] font-mono transition-colors flex items-center gap-1"
                      >
                        <span>Copy Code</span>
                        <span>📋</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-bg border border-border text-[11px] font-mono text-muted overflow-x-auto max-h-28">
                      {htmlSnippet}
                    </pre>
                  </div>
                </div>

                {/* Right Column: Customization Inspector (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M1.75 2.5h10.5a.25.25 0 0 1 .25.25v10.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75a.25.25 0 0 1 .25-.25ZM0 2.75C0 1.784.784 1 1.75 1h10.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 12.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75Z"/>
                        </svg>
                        <h3 className="text-[13px] font-semibold text-text">Favicon Settings</h3>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setImgUrl("");
                        }}
                        className="text-[11px] font-mono text-muted hover:text-red-400 transition-colors"
                      >
                        Change Logo
                      </button>
                    </div>

                    {/* Shape / Mask */}
                    <div>
                      <span className="block text-[11px] font-mono text-muted mb-2">Icon Shape / Mask</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "square", label: "Square" },
                          { id: "rounded", label: "Rounded" },
                          { id: "circle", label: "Circle" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setOptions({ ...options, shape: s.id as FaviconOptions["shape"] })}
                            className={`h-8 rounded-lg border text-[11px] font-mono transition-all ${
                              options.shape === s.id
                                ? "border-accent bg-accent/10 text-accent font-semibold"
                                : "border-border bg-bg/50 text-muted hover:text-text hover:border-border-hover"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Margin / Padding Slider */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-muted">Edge Padding</span>
                        <span className="text-accent font-semibold">{options.paddingPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="35"
                        value={options.paddingPercent}
                        onChange={(e) => setOptions({ ...options, paddingPercent: Number(e.target.value) })}
                        className="w-full h-1.5 rounded-full bg-border accent-accent cursor-pointer"
                      />
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">Background Fill</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOptions({ ...options, backgroundColor: "transparent" })}
                          className={`h-9 px-3 rounded-lg border text-[11px] font-mono transition-colors ${
                            options.backgroundColor === "transparent"
                              ? "border-accent bg-accent/10 text-accent font-semibold"
                              : "border-border bg-bg text-muted hover:text-text"
                          }`}
                        >
                          Transparent
                        </button>
                        <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg border border-border bg-bg flex-1">
                          <input
                            type="color"
                            value={options.backgroundColor === "transparent" ? "#ffffff" : options.backgroundColor}
                            onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                            className="h-5 w-5 rounded border-0 bg-transparent cursor-pointer"
                          />
                          <span className="font-mono text-[11px] text-text">
                            {options.backgroundColor === "transparent" ? "None" : options.backgroundColor.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* App / Website Name */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">Application Name</label>
                      <input
                        type="text"
                        value={options.appName}
                        onChange={(e) => setOptions({ ...options, appName: e.target.value })}
                        placeholder="My Website"
                        className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-[12px] font-mono text-text focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Theme Color */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1.5">Theme / Brand Color</label>
                      <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg border border-border bg-bg">
                        <input
                          type="color"
                          value={options.themeColor}
                          onChange={(e) => setOptions({ ...options, themeColor: e.target.value })}
                          className="h-5 w-5 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[11px] text-text font-semibold">
                          {options.themeColor.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Action Execution: Download ZIP */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <button
                        onClick={downloadFullZip}
                        disabled={isGenerating || !variants.length}
                        className="w-full h-11 rounded-lg bg-accent text-white font-medium text-[13px] hover:bg-accent-strong disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        {isGenerating ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Building Favicon Package…</span>
                          </>
                        ) : (
                          <>
                            <span>Download Favicon Package (.ZIP)</span>
                            <span className="text-[11px] font-mono opacity-80">(8 Files)</span>
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-muted text-center font-mono">
                        Contains favicon.ico, 6 PNG variants, site.webmanifest & README
                      </p>
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
