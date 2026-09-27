"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface ToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  href: string;
  key: string;
}

const ALL_TOOLS: ToolItem[] = [
  {
    id: "converter",
    name: "Image Converter",
    category: "Convert",
    description: "Batch convert PNG, JPG, WebP, AVIF, BMP with quality control",
    href: "/tools/image-converter",
    key: "C",
  },
  {
    id: "compressor",
    name: "Image Compressor",
    category: "Optimize",
    description: "Shrink image size up to 85% with before/after comparison",
    href: "/tools/image-compressor",
    key: "K",
  },
  {
    id: "resizer",
    name: "Image Resizer",
    category: "Edit",
    description: "Scale to custom dimensions, aspect ratio lock & social presets",
    href: "/tools/image-resizer",
    key: "R",
  },
  {
    id: "svg",
    name: "SVG Studio & Vectorizer",
    category: "Vector",
    description: "Render raster SVG, optimize code markup, or trace bitmaps",
    href: "/tools/svg-tools",
    key: "S",
  },
  {
    id: "cropper",
    name: "Image Cropper",
    category: "Edit",
    description: "Visual crop handles, 1:1, 16:9, 4:3, zoom & composition grid",
    href: "/tools/image-cropper",
    key: "X",
  },
  {
    id: "rotate",
    name: "Rotate & Flip",
    category: "Edit",
    description: "90° rotations, 180° invert, horizontal and vertical mirroring",
    href: "/tools/image-rotate-flip",
    key: "T",
  },
  {
    id: "metadata",
    name: "EXIF & Metadata Inspector",
    category: "Privacy",
    description: "Camera specs, exposure, GPS tags & 1-click privacy sanitizer",
    href: "/tools/metadata",
    key: "M",
  },
  {
    id: "image-to-pdf",
    name: "Image → PDF",
    category: "Document",
    description: "Bundle images into PDF with A4, Letter sizes & margins",
    href: "/tools/image-to-pdf",
    key: "P",
  },
  {
    id: "pdf-to-image",
    name: "PDF → Image",
    category: "Document",
    description: "Extract PDF pages as PNG, JPG, WebP up to 300 DPI",
    href: "/tools/pdf-to-image",
    key: "D",
  },
  {
    id: "watermark",
    name: "Image Watermark",
    category: "Protect",
    description: "Custom text or logo watermark with 9-anchor positioning",
    href: "/tools/watermark",
    key: "W",
  },
  {
    id: "background",
    name: "Background Keyer",
    category: "Edit",
    description: "Eyedropper background sampling & transparent PNG removal",
    href: "/tools/background",
    key: "B",
  },
  {
    id: "base64",
    name: "Base64 Image Studio",
    category: "Code",
    description: "Encode Data URIs, HTML & CSS snippets or decode strings",
    href: "/tools/base64",
    key: "6",
  },
  {
    id: "info",
    name: "Image Info & Palette",
    category: "Diagnostics",
    description: "Pixel diagnostics, megapixels & dominant palette extraction",
    href: "/tools/image-info",
    key: "I",
  },
  {
    id: "favicon",
    name: "Favicon Generator & Studio",
    category: "Asset",
    description: "Generate multi-resolution favicon.ico, Apple touch icons & webmanifest ZIP",
    href: "/tools/favicon-generator",
    key: "F",
  },
  {
    id: "svg-viewer",
    name: "SVG Viewer & Editor",
    category: "Vector",
    description: "Paste SVG code directly, live inspect & edit markup, swap colors, and save as SVG/PNG",
    href: "/tools/svg-viewer",
    key: "V",
  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = ALL_TOOLS.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          onClose();
          router.push(selected.href);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-muted/30">
          <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a tool name or category... (e.g. compress, svg, exif)"
            className="w-full bg-transparent text-[14px] text-text placeholder:text-muted focus:outline-none"
          />
          <span className="text-[10px] font-mono text-muted/60 border border-border px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-border/20">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted font-mono text-[12px]">
              No image tools match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onClose();
                    router.push(tool.href);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-accent/10 border-l-2 border-accent text-text"
                      : "text-text/80 hover:bg-surface-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-6 w-6 rounded flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                        isSelected
                          ? "bg-accent text-white"
                          : "bg-surface-muted text-muted border border-border"
                      }`}
                    >
                      {tool.key}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[13px] text-text truncate">
                          {tool.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-border/80 text-muted">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted truncate">{tool.description}</p>
                    </div>
                  </div>

                  <span className="text-muted/40 font-mono text-[12px] shrink-0 ml-2">↵</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-border bg-surface-muted/40 flex items-center justify-between text-[11px] font-mono text-muted">
          <span>Navigate with ↑ ↓ · Press Enter to open</span>
          <span className="text-accent font-semibold">15 Tools Available</span>
        </div>
      </div>
    </div>
  );
}
