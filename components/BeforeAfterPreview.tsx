"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface BeforeAfterPreviewProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeStats?: string;
  afterStats?: string;
  savingsBadge?: string;
}

export default function BeforeAfterPreview({
  beforeUrl,
  afterUrl,
  beforeLabel = "Original",
  afterLabel = "Result",
  beforeStats,
  afterStats,
  savingsBadge,
}: BeforeAfterPreviewProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [mode, setMode] = useState<"slider" | "side-by-side">("slider");
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Track container width accurately across window resizes and orientation changes
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    setContainerWidth(el.clientWidth);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="w-full">
      {/* Header bar with mode switch & metrics */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text">Preview</span>
          {savingsBadge && (
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold text-accent">
              {savingsBadge}
            </span>
          )}
        </div>

        <div className="flex rounded-md border border-border bg-surface p-0.5 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setMode("slider")}
            className={`rounded px-2.5 py-1 text-[10px] sm:text-[11px] transition-colors ${
              mode === "slider" ? "bg-accent text-white font-medium" : "text-muted hover:text-text"
            }`}
          >
            Split Slider
          </button>
          <button
            type="button"
            onClick={() => setMode("side-by-side")}
            className={`rounded px-2.5 py-1 text-[10px] sm:text-[11px] transition-colors ${
              mode === "side-by-side" ? "bg-accent text-white font-medium" : "text-muted hover:text-text"
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {mode === "slider" ? (
        <div
          ref={containerRef}
          onMouseDown={() => (isDragging.current = true)}
          onMouseUp={() => (isDragging.current = false)}
          onMouseLeave={() => (isDragging.current = false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => (isDragging.current = true)}
          onTouchEnd={() => (isDragging.current = false)}
          onTouchMove={handleTouchMove}
          className="relative h-64 sm:h-96 w-full cursor-ew-resize select-none overflow-hidden rounded-xl border border-border bg-surface/50 touch-none"
        >
          {/* Background: After Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterUrl}
            alt={afterLabel}
            className="absolute inset-0 h-full w-full object-contain pointer-events-none p-2"
          />

          {/* After Label Badge: Top on mobile, Bottom on desktop */}
          <div className="absolute top-2 right-2 sm:top-auto sm:bottom-3 sm:right-3 max-w-[46%] rounded-md bg-surface/90 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[10px] sm:text-[11px] text-text border border-border shadow-xs pointer-events-none z-10">
            <span className="font-semibold text-accent block sm:inline truncate">{afterLabel}</span>
            {afterStats && <span className="text-muted block sm:inline sm:ml-1.5 text-[9px] sm:text-[10px] truncate">{afterStats}</span>}
          </div>

          {/* Foreground: Before Image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={beforeUrl}
              alt={beforeLabel}
              className="absolute inset-0 h-full max-w-none object-contain pointer-events-none p-2"
              style={{
                width: containerWidth ? `${containerWidth}px` : "100%",
                height: "100%",
              }}
            />
            {/* Before Label Badge: Top on mobile, Bottom on desktop */}
            <div className="absolute top-2 left-2 sm:top-auto sm:bottom-3 sm:left-3 max-w-[46%] rounded-md bg-surface/90 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[10px] sm:text-[11px] text-text border border-border shadow-xs pointer-events-none z-10">
              <span className="font-semibold block sm:inline truncate">{beforeLabel}</span>
              {beforeStats && <span className="text-muted block sm:inline sm:ml-1.5 text-[9px] sm:text-[10px] truncate">{beforeStats}</span>}
            </div>
          </div>

          {/* Precision Divider Handle */}
          <div
            className="absolute bottom-0 top-0 w-0.5 bg-accent z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-accent bg-surface shadow-lg text-accent transition-transform hover:scale-110">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center justify-between mb-2 font-mono text-[11px]">
              <span className="font-medium text-text">{beforeLabel}</span>
              {beforeStats && <span className="text-muted">{beforeStats}</span>}
            </div>
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg bg-bg/50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={beforeUrl} alt={beforeLabel} className="max-h-full max-w-full object-contain" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center justify-between mb-2 font-mono text-[11px]">
              <span className="font-medium text-accent">{afterLabel}</span>
              {afterStats && <span className="text-muted">{afterStats}</span>}
            </div>
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg bg-bg/50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={afterUrl} alt={afterLabel} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
