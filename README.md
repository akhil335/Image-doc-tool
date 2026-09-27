# DocForge — All-in-One Image Toolkit

A modern, high-performance, 100% client-side image and document processing platform built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

All image manipulation, vectorization, compression, metadata inspection, and PDF bundling runs directly in the user's browser using HTML5 Canvas, Web APIs, `pdf-lib`, and `pdfjs-dist`. **Zero files are uploaded to any server, guaranteeing absolute privacy and instantaneous processing.**

---

## 🛠️ Built-in Image Tools

| # | Tool | Route | Capabilities |
|---|------|-------|--------------|
| 01 | **Image Converter** | `/tools/image-converter` | Batch convert between PNG, JPG, WebP, AVIF, and BMP with quality control and ZIP download. |
| 02 | **Image Compressor** | `/tools/image-compressor` | Shrink image file size up to 80% with visual before/after slider comparison and batch export. |
| 03 | **SVG Studio & Vectorizer** | `/tools/svg-tools` | Rasterize SVG to high-res PNG/JPG, optimize SVG markup, and trace raster images to real vector paths. |
| 04 | **Image Resizer** | `/tools/image-resizer` | Custom dimensions, aspect ratio locks, percentage scaling, and social presets (1080p, IG, Story). |
| 05 | **Image Cropper** | `/tools/image-cropper` | Freeform and fixed aspect ratios (1:1, 16:9, 4:3, 9:16), zoom, rotation, and rule-of-thirds grid. |
| 06 | **Rotate & Flip** | `/tools/image-rotate-flip` | 90° CW/CCW, 180°, horizontal & vertical mirror, and arbitrary angle slider. |
| 07 | **EXIF & Metadata** | `/tools/metadata` | Deep camera, exposure, and GPS tag inspection with one-click privacy sanitization/stripping. |
| 08 | **Image → PDF** | `/tools/image-to-pdf` | Reorder JPG/PNG images, choose page sizes (A4, Letter, Legal, Fit), set orientation and margins. |
| 09 | **PDF → Image** | `/tools/pdf-to-image` | Extract all or selected PDF pages into high-resolution PNG, JPG, or WebP images. |
| 10 | **Image Watermark** | `/tools/watermark` | Custom text or logo image watermarks with 9-anchor positioning, tiled repeats, and opacity. |
| 11 | **Background Tools** | `/tools/background` | Eyedropper chroma keying and color replacement for solid backgrounds to transparent PNG. |
| 12 | **Base64 Converter** | `/tools/base64` | Encode images into Data URIs, HTML `<img>`, and CSS snippets, or decode Base64 to image files. |
| 13 | **Image Info & Palette** | `/tools/image-info` | Aspect ratio diagnostics, megapixels, transparency detection, and dominant color palette extraction. |
| 14 | **Favicon Generator & Studio** | `/tools/favicon-generator` | Multi-resolution favicon.ico (16/32/48px), Apple Touch, Android Chrome icons, site.webmanifest, and full ZIP download. |
| 15 | **SVG Viewer & Editor** | `/tools/svg-viewer` | Direct SVG code pasting, live visual editor, XML formatting/minifying, color swapping, and multi-format export. |

---

## 📁 Architecture

```
app/
  page.tsx                         # Landing page with hero, live search, categories, stats, and roadmap
  layout.tsx                       # Global theme script and SEO metadata
  sitemap.ts                       # Dynamic XML sitemap with all tool routes
  tools/
    image-converter/               # Batch multi-format converter
    image-compressor/              # Visual compression suite
    svg-tools/                     # SVG rasterizer, optimizer, and vectorizer
    image-resizer/                 # Dimension and preset resizer
    image-cropper/                 # Precision visual crop tool
    image-rotate-flip/             # Rotation and mirror suite
    metadata/                      # EXIF viewer and metadata stripper
    image-to-pdf/                  # Preserved & enhanced image-to-PDF tool
    pdf-to-image/                  # Preserved & enhanced PDF-to-image tool
    watermark/                     # Text & logo watermark tool
    background/                    # Chroma key & background replacement
    base64/                        # Base64 encoder & decoder
    image-info/                    # Diagnostic info & palette extractor
    favicon-generator/             # Complete favicon suite with ICO binary and ZIP bundling
    svg-viewer/                    # Live SVG code editor, viewer, XML formatter & color replacer
components/
  Header.tsx                       # Sticky header with tools dropdown and mobile drawer
  Footer.tsx                       # Categorized directory links and privacy guarantee
  Dropzone.tsx                     # Drag & drop upload area with accessibility support
  ToolHeader.tsx                   # Standardized tool header with breadcrumbs and badges
  ProgressBar.tsx                  # Accessible progress indicator
  BeforeAfterPreview.tsx           # Split slider and side-by-side comparison
  ThemeToggle.tsx                  # Dark / Light theme toggle
  Toast.tsx                        # Non-intrusive action feedback toasts
lib/
  fileUtils.ts                     # File size formatting, blob downloads, savings math, image loaders
  canvasUtils.ts                   # Core canvas resizing, cropping, rotating, watermarking, color keying
  svgUtils.ts                      # SVG rasterization, optimizer, and true color contour vectorization
  svgEditorUtils.ts                # SVG XML formatting, minifying, stats parser, and JSX code generator
  exifUtils.ts                     # Pure TypeScript EXIF and TIFF parser & metadata stripper
  faviconUtils.ts                  # Pure client ICO binary packer, canvas shape generator, and webmanifest builder
  toolsRegistry.ts                 # Central metadata registry and categories for all 15 tools
  imageToPdf.ts                    # pdf-lib PDF builder with margins and orientation
  pdfToImages.ts                   # pdfjs-dist renderer with WebP and page range selection
```

---

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Then visit [http://localhost:3000](http://localhost:3000).

---

## 🔒 Privacy & Security

Every file operation runs in the client browser using standard web APIs (`OffscreenCanvas`, `CanvasRenderingContext2D`, `FileReader`, `Blob`, `pdf-lib`, and `pdfjs-dist`). No files or image data are transmitted across the network.
