import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const { theme } = useTheme()
  
  return (
    <footer className="border-t border-border bg-surface/70 text-[13px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-text text-[16px] tracking-tight">
              <Image src = {theme === "dark" ? "/dark-logo.png" : "/light-logo.png"} alt = "logo" width = {70} height = {30} />
            </Link>

            <p className="text-muted max-w-sm leading-relaxed text-[13px]">
              High-performance client-side image laboratory. Fast, private, and offline-capable utilities with zero third-party cloud uploads.
            </p>

            <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted">100% In-Browser Engine Active</span>
            </div>
          </div>

          {/* Column: Studio Tools */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
              Studio Tools
            </h4>
            <ul className="space-y-2 text-muted text-[13px]">
              <li>
                <Link href="/tools/image-compressor" className="hover:text-accent transition-colors">
                  Compressor
                </Link>
              </li>
              <li>
                <Link href="/tools/image-converter" className="hover:text-accent transition-colors">
                  Format Converter
                </Link>
              </li>
              <li>
                <Link href="/tools/image-resizer" className="hover:text-accent transition-colors">
                  Resizer & Scale
                </Link>
              </li>
              <li>
                <Link href="/tools/image-cropper" className="hover:text-accent transition-colors">
                  Framing & Crop
                </Link>
              </li>
              <li>
                <Link href="/tools/svg-tools" className="hover:text-accent transition-colors">
                  SVG Vectorizer
                </Link>
              </li>
              <li>
                <Link href="/tools/svg-viewer" className="hover:text-accent transition-colors">
                  SVG Viewer & Editor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Utilities */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
              Utilities
            </h4>
            <ul className="space-y-2 text-muted text-[13px]">
              <li>
                <Link href="/tools/image-to-pdf" className="hover:text-accent transition-colors">
                  Image → PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-image" className="hover:text-accent transition-colors">
                  PDF → Image
                </Link>
              </li>
              <li>
                <Link href="/tools/watermark" className="hover:text-accent transition-colors">
                  Watermark Studio
                </Link>
              </li>
              <li>
                <Link href="/tools/metadata" className="hover:text-accent transition-colors">
                  EXIF & GPS Sanitizer
                </Link>
              </li>
              <li>
                <Link href="/tools/background" className="hover:text-accent transition-colors">
                  Background Keyer
                </Link>
              </li>
              <li>
                <Link href="/tools/base64" className="hover:text-accent transition-colors">
                  Base64 Studio
                </Link>
              </li>
              <li>
                <Link href="/tools/favicon-generator" className="hover:text-accent transition-colors">
                  Favicon Studio & ZIP
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Architecture */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
              Architecture
            </h4>
            <ul className="space-y-2 text-muted text-[12px] font-mono">
              <li>
                <span className="text-text font-medium">Local Sandboxed</span>
              </li>
              <li>
                <span className="block text-muted/80">WebAssembly mozjpeg</span>
              </li>
              <li>
                <span className="block text-muted/80">Hardware Canvas 2D</span>
              </li>
              <li>
                <span className="block text-muted/80">0 Bytes Server Storage</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-muted text-[12px]">
          <p>
            Your files stay in your browser whenever possible. 100% private.
          </p>
          <p className="font-mono text-[11px] text-muted/70">
            docst.tech · High-Precision Creative Toolkit
          </p>
        </div>
      </div>
    </footer>
  );
}
