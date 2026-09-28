"use client";

import { useState, useEffect } from "react";
import Link                    from "next/link";
import ThemeToggle             from "./ThemeToggle";
import CommandPalette          from "./CommandPalette";
import Image                   from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const { theme } = useTheme()

  const [isScrolled, setIsScrolled]         = useState(false);
  const [isCmdOpen, setIsCmdOpen]           = useState(false);
  const [toolsDropdown, setToolsDropdown]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <>
      <CommandPalette isOpen = {isCmdOpen} onClose = {() => setIsCmdOpen(false)} />

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-150 ${isScrolled
          ? "border-b border-border/80 bg-bg/85 backdrop-blur-md shadow-xs"
          :  "border-b border-border/50 bg-bg/50 backdrop-blur-xs"
          }`}
      >
        <div className = "mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
          {/* Brand Mark */}
          <div className = "flex items-center gap-6">
            <Link
              href      = "/"
              onClick   = {() => setMobileMenuOpen(false)}
              className = "group flex items-center gap-2.5 text-text focus-ring rounded-md py-1"
            >
              <Image src = {theme === "dark" ? "/dark-logo.png" : "/light-logo.png"} alt = "logo" width = {70} height = {30} />
              {/* Studio Aperture Vector Glyph */}
              {/* <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <svg    className = "h-4 w-4" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2.2" strokeLinecap = "round" strokeLinejoin = "round">
                <circle cx        = "12" cy           = "12" r           = "10" />
                <path   d         = "m14.31 8 5.74 9.94" />
                <path   d         = "M9.69 8h11.48" />
                <path   d         = "m7.38 12 5.74-9.94" />
                <path   d         = "M9.69 16 3.95 6.06" />
                <path   d         = "M14.31 16H2.83" />
                <path   d         = "m16.62 12-5.74 9.94" />
                </svg>
              </div>

              <div  className = "flex items-baseline gap-2">
              <span className = "font-display font-bold tracking-tight text-[16px] text-text">
                  Docsy
                </span>
              </div> */}
            </Link>

            {/* Navigation Links */}
            <nav className = "hidden md:flex items-center gap-1 text-[13px] font-medium text-muted">
              {/* Tools dropdown */}
              <div
                className    = "relative"
                onMouseEnter = {() => setToolsDropdown(true)}
                onMouseLeave = {() => setToolsDropdown(false)}
              >
                <button
                  type      = "button"
                  className = "flex items-center gap-1 px-3 py-1.5 rounded-md hover:text-text hover:bg-surface-muted transition-colors"
                >
                  <span>Tools</span>
                  <svg  className = "w-3.5 h-3.5 opacity-60" viewBox = "0 0 16 16" fill = "currentColor">
                  <path d         = "M4.427 6.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 6H4.604a.25.25 0 0 0-.177.427Z" />
                  </svg>
                </button>

                {toolsDropdown && (
                  <div  className = "absolute top-full left-0 w-64 pt-1 animate-fade-in">
                  <div  className = "rounded-xl border border-border bg-surface p-2 shadow-xl divide-y divide-border/20">
                  <div  className = "py-1">
                  <span className = "block px-2.5 py-1 text-[10px] font-mono text-muted uppercase tracking-wider">
                          Studio Processing
                        </span>
                        <Link
                          href      = "/tools/image-compressor"
                          className = "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] text-text hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <span>Image Compressor</span>
                          <span className = "font-mono text-[10px] text-muted">K</span>
                        </Link>
                        <Link
                          href      = "/tools/image-converter"
                          className = "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] text-text hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <span>Image Converter</span>
                          <span className = "font-mono text-[10px] text-muted">C</span>
                        </Link>
                        <Link
                          href      = "/tools/image-resizer"
                          className = "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] text-text hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <span>Image Resizer</span>
                          <span className = "font-mono text-[10px] text-muted">R</span>
                        </Link>
                        <Link
                          href      = "/tools/svg-tools"
                          className = "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] text-text hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <span>SVG Studio & Tracing</span>
                          <span className = "font-mono text-[10px] text-muted">S</span>
                        </Link>
                        <Link
                          href      = "/tools/favicon-generator"
                          className = "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] text-text hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <span>Favicon Studio & ZIP</span>
                          <span className = "font-mono text-[10px] text-muted">F</span>
                        </Link>
                        <Link
                          href      = "/tools/svg-viewer"
                          className = "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] text-text hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <span>SVG Viewer & Editor</span>
                          <span className = "font-mono text-[10px] text-muted">V</span>
                        </Link>
                      </div>

                      <div  className = "py-1">
                      <span className = "block px-2.5 py-1 text-[10px] font-mono text-muted uppercase tracking-wider">
                          Visual & Geometry
                        </span>
                        <Link
                          href      = "/tools/image-cropper"
                          className = "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] text-text hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <span>Image Cropper</span>
                          <span className = "font-mono text-[10px] text-muted">X</span>
                        </Link>
                        <Link
                          href      = "/tools/metadata"
                          className = "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] text-text hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <span>EXIF Privacy Sanitizer</span>
                          <span className = "font-mono text-[10px] text-muted">M</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href      = "/tools/image-compressor"
                className = "px-3 py-1.5 rounded-md hover:text-text hover:bg-surface-muted transition-colors"
              >
                Compress
              </Link>
              <Link
                href      = "/tools/image-converter"
                className = "px-3 py-1.5 rounded-md hover:text-text hover:bg-surface-muted transition-colors"
              >
                Convert
              </Link>
              <Link
                href      = "/tools/svg-tools"
                className = "px-3 py-1.5 rounded-md hover:text-text hover:bg-surface-muted transition-colors"
              >
                Vectorize
              </Link>
              <Link
                href      = "/tools/svg-viewer"
                className = "px-3 py-1.5 rounded-md hover:text-text hover:bg-surface-muted transition-colors"
              >
                SVG Editor
              </Link>
            </nav>
          </div>

          {/* Right Action Group */}
          <div className = "flex items-center gap-2 sm:gap-2.5">
            {/* Quick Command ⌘K trigger */}
            <button
              type      = "button"
              onClick   = {() => setIsCmdOpen(true)}
              className = "flex items-center gap-1.5 sm:gap-2 h-8 px-2 sm:px-2.5 rounded-lg border border-border bg-surface-muted/50 text-muted hover:text-text hover:border-accent hover:bg-surface text-[12px] font-mono transition-colors shadow-xs"
              title     = "Search tools (⌘K or Ctrl+K)"
            >
              <svg  className = "w-3.5 h-3.5 text-accent" viewBox = "0 0 16 16" fill = "currentColor">
              <path d         = "M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z" />
              </svg>
              <span className = "hidden sm:inline">Search</span>
              <kbd  className = "hidden sm:inline-block rounded bg-bg px-1 text-[10px] text-muted border border-border">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* All Tools Anchor Button (Desktop) */}
            <a
              href      = "#tools-directory"
              className = "hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-text text-bg hover:opacity-90 text-[12px] font-medium transition-opacity shadow-xs"
            >
              <span>Explore All</span>
              <span className = "font-mono text-[10px] opacity-75">(15)</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type       = "button"
              onClick    = {() => setMobileMenuOpen((prev) => !prev)}
              className  = "flex md:hidden items-center justify-center h-8 w-8 rounded-lg border border-border bg-surface text-text hover:border-accent transition-colors"
              aria-label = "Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg  className = "w-4 h-4 text-accent" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2.2" strokeLinecap = "round" strokeLinejoin = "round">
                <path d         = "M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg  className = "w-4 h-4 text-text" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "2" strokeLinecap = "round" strokeLinejoin = "round">
                <path d         = "M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div  className = "md:hidden border-b border-border bg-surface/95 backdrop-blur-md px-4 py-3 shadow-xl animate-fade-in max-h-[80vh] overflow-y-auto divide-y divide-border/30">
          <div  className = "pb-3 flex items-center justify-between">
          <span className = "font-mono text-[11px] text-muted uppercase tracking-wider">
                15 Studio Tools
              </span>
              <a
                href      = "#tools-directory"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "text-[11px] font-mono text-accent font-semibold hover:underline"
              >
                View Grid (15) ↓
              </a>
            </div>

            {/* Mobile Tool Quick Links */}
            <div className = "py-2.5 grid grid-cols-2 gap-1.5 text-[12px]">
              <Link
                href      = "/tools/image-compressor"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Image Compressor
              </Link>
              <Link
                href      = "/tools/image-converter"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Image Converter
              </Link>
              <Link
                href      = "/tools/svg-viewer"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                SVG Viewer & Editor
              </Link>
              <Link
                href      = "/tools/favicon-generator"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Favicon Generator
              </Link>
              <Link
                href      = "/tools/svg-tools"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                SVG Studio & Trace
              </Link>
              <Link
                href      = "/tools/image-resizer"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Image Resizer
              </Link>
              <Link
                href      = "/tools/image-cropper"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Image Cropper
              </Link>
              <Link
                href      = "/tools/metadata"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                EXIF Sanitizer
              </Link>
              <Link
                href      = "/tools/image-to-pdf"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Image → PDF
              </Link>
              <Link
                href      = "/tools/pdf-to-image"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                PDF → Image
              </Link>
              <Link
                href      = "/tools/background"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Background Keyer
              </Link>
              <Link
                href      = "/tools/watermark"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Watermark Studio
              </Link>
              <Link
                href      = "/tools/base64"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Base64 Studio
              </Link>
              <Link
                href      = "/tools/image-info"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Image Info & Palette
              </Link>
              <Link
                href      = "/tools/image-rotate-flip"
                onClick   = {() => setMobileMenuOpen(false)}
                className = "p-2 rounded-lg bg-surface-muted/40 hover:bg-accent/10 hover:text-accent font-medium transition-colors"
              >
                Rotate & Flip
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
