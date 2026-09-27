"use client";

import { useCallback, useRef, useState } from "react";

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
  className?: string;
}

export default function Dropzone({
  accept,
  multiple = false,
  onFiles,
  label = "Drop your images here",
  hint = "or browse files from your device",
  compact = false,
  className = "",
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        // Prevent child elements from flickering drag leave
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`group relative cursor-pointer select-none rounded-xl border transition-all duration-200 ease-out focus-ring ${
        compact ? "p-4 sm:p-6" : "p-6 sm:p-10 sm:py-12"
      } ${
        isDragging
          ? "border-accent bg-accent/5 scale-[1.01] shadow-lg shadow-accent/10"
          : "border-border/80 bg-surface/60 hover:border-accent/50 hover:bg-surface hover:shadow-sm"
      } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center justify-center text-center">
        {/* Animated Upload Icon */}
        <div
          className={`flex items-center justify-center rounded-lg border transition-all duration-200 ${
            compact ? "h-10 w-10 mb-3" : "h-12 w-12 mb-4"
          } ${
            isDragging
              ? "border-accent bg-accent text-white -translate-y-1 scale-110 shadow-md shadow-accent/20"
              : "border-border bg-surface text-muted group-hover:border-accent/40 group-hover:text-accent group-hover:-translate-y-0.5"
          }`}
        >
          <svg
            width={compact ? "18" : "20"}
            height={compact ? "18" : "20"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {/* Primary Label */}
        <p className="font-sans text-[15px] sm:text-[16px] font-medium text-text tracking-tight transition-colors">
          {isDragging ? "Drop to upload immediately" : label}
        </p>

        {/* Secondary Subtitle */}
        <p className="mt-1 text-[13px] text-muted">
          {isDragging ? "Release files to start processing" : hint}
        </p>

        {/* Format Badges */}
        {!compact && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 font-mono text-[10px] text-muted/80">
            <span className="rounded px-2 py-0.5 bg-bg border border-border/60">PNG</span>
            <span className="rounded px-2 py-0.5 bg-bg border border-border/60">JPG</span>
            <span className="rounded px-2 py-0.5 bg-bg border border-border/60">WEBP</span>
            <span className="rounded px-2 py-0.5 bg-bg border border-border/60">SVG</span>
            <span className="rounded px-2 py-0.5 bg-bg border border-border/60">AVIF</span>
            {multiple && (
              <span className="rounded px-2 py-0.5 bg-accent/10 text-accent font-medium">Batch</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
