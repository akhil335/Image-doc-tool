export interface ToolSeoInfo {
  id: string;
  name: string;
  category: string;
  headline: string;
  subheadline: string;
  steps: { title: string; desc: string }[];
  features: { title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
}

export const TOOL_SEO_DATA: Record<string, ToolSeoInfo> = {
  "image-converter": {
    id: "image-converter",
    name: "Online Image Converter",
    category: "Conversion",
    headline: "Convert Images Between PNG, JPG, WebP, AVIF & BMP Instantly",
    subheadline:
      "Batch convert your images to modern web-optimized formats right in your browser. Fast, 100% private, and completely free.",
    steps: [
      {
        title: "1. Upload Your Images",
        desc: "Drag and drop your images into the dropzone or click to browse files from your device. Supports multi-file batch upload.",
      },
      {
        title: "2. Choose Target Format & Quality",
        desc: "Select your desired output format (PNG, JPG, WebP, AVIF, or BMP) and adjust the quality slider to balance size and clarity.",
      },
      {
        title: "3. Convert & Download",
        desc: "Click 'Convert' to process images in parallel. Download individual files or export all converted images at once as a convenient ZIP package.",
      },
    ],
    features: [
      {
        title: "100% Private & In-Browser",
        desc: "All conversions run directly on your device via HTML5 Canvas. Your sensitive images are never uploaded to any remote server or cloud storage.",
      },
      {
        title: "Modern Next-Gen Formats",
        desc: "Easily switch legacy JPG or PNG files into cutting-edge WebP or AVIF formats to drastically reduce website loading times.",
      },
      {
        title: "Batch Processing & ZIP Export",
        desc: "Convert dozens of photos simultaneously with zero waiting queues. Grab all converted assets in one click with built-in ZIP archiving.",
      },
      {
        title: "Granular Quality Controls",
        desc: "Fine-tune output compression parameters with precision to get the exact file size and visual fidelity you require.",
      },
    ],
    faqs: [
      {
        question: "Is this image converter free to use?",
        answer: "Yes, Docsy Image Converter is 100% free with no file limits, daily quotas, or watermarks.",
      },
      {
        question: "Are my images uploaded to any server?",
        answer: "No. Everything runs locally in your browser using client-side JavaScript. Your photos never leave your machine.",
      },
      {
        question: "What image formats are supported?",
        answer: "You can convert between PNG, JPG/JPEG, WebP, AVIF, and BMP formats with full quality controls.",
      },
      {
        question: "Can I convert multiple images at once?",
        answer: "Yes! You can drop multiple images and convert them all in parallel, then download them individually or as a single ZIP file.",
      },
    ],
  },

  "image-compressor": {
    id: "image-compressor",
    name: "Online Image Compressor",
    category: "Optimization",
    headline: "Compress Images Online Without Losing Quality",
    subheadline:
      "Reduce image file sizes by up to 80% while retaining pixel-sharp details. Includes interactive before/after visual comparison.",
    steps: [
      {
        title: "1. Add Your Images",
        desc: "Drop single or multiple JPG, PNG, WebP, or AVIF images onto the compression workspace.",
      },
      {
        title: "2. Adjust Compression & Presets",
        desc: "Select a quick preset (Balanced, High Quality, Max Compression) or dial in a custom quality percentage and resolution limits.",
      },
      {
        title: "3. Compare & Save",
        desc: "Slide across the interactive before/after viewer to inspect quality, check file size reduction, and download compressed files.",
      },
    ],
    features: [
      {
        title: "Up to 80% Size Reduction",
        desc: "Smart quantization algorithms shrink multi-megabyte graphics into lightweight assets ready for lightning-fast web delivery.",
      },
      {
        title: "Split-Screen Before/After Slider",
        desc: "Inspect compressed images side-by-side with the original before saving to ensure not a single noticeable artifact is introduced.",
      },
      {
        title: "Zero Server Uploads",
        desc: "Client-side image processing protects sensitive documents, personal snapshots, and corporate assets with absolute privacy.",
      },
      {
        title: "Dimension Constraints",
        desc: "Optionally downscale ultra-high resolution camera photos to 1080p Full HD or 2K QHD for optimal web display.",
      },
    ],
    faqs: [
      {
        question: "How does Docsy compress images without quality loss?",
        answer: "Docsy leverages intelligent canvas compression and modern encoders like WebP to remove invisible redundancies without degrading perceived visual sharpness.",
      },
      {
        question: "Will my images look blurry after compression?",
        answer: "No. You can preview the exact output using the interactive before/after slider and adjust the quality slider until it looks perfect.",
      },
      {
        question: "Is there a limit on how many images I can compress?",
        answer: "There are no limits. You can compress as many images as you need directly on your machine.",
      },
      {
        question: "Does this compressor work offline?",
        answer: "Yes! Since all processing is performed client-side in your browser, it continues to work smoothly even without internet connectivity.",
      },
    ],
  },

  "svg-tools": {
    id: "svg-tools",
    name: "SVG Studio & Vectorizer",
    category: "Vector Suite",
    headline: "Convert, Optimize & Trace Vector Graphics",
    subheadline:
      "Rasterize SVG to high-resolution PNG/JPG, clean and optimize SVG markup, or trace raster bitmaps into true vector paths.",
    steps: [
      {
        title: "1. Select SVG or Raster Image",
        desc: "Upload an SVG file to render and optimize, or upload a PNG/JPG graphic to trace into vector paths.",
      },
      {
        title: "2. Configure Render or Vector Settings",
        desc: "Choose output resolution multipliers (1x, 2x, 3x Retina) or tune vector contour smoothing and path thresholds.",
      },
      {
        title: "3. Export Crisp Vectors or Assets",
        desc: "Download sanitized SVG code, sharp PNG files with transparent backgrounds, or copy code directly into your project.",
      },
    ],
    features: [
      {
        title: "True Path Tracing",
        desc: "Transform pixelated logos and sketches into clean, infinitely scalable vector SVG paths.",
      },
      {
        title: "Retina Scale Rendering",
        desc: "Rasterize vector illustrations at up to 300 DPI or 3x scale for crystal-clear prints and ultra-crisp web display.",
      },
      {
        title: "SVG Markup Optimizer",
        desc: "Strip unnecessary metadata, hidden editor tags, and redundant coordinates to produce lightweight, production-ready SVG files.",
      },
      {
        title: "Client-Side Processing",
        desc: "Execute complex vectorization algorithms entirely within your web browser with zero server latency.",
      },
    ],
    faqs: [
      {
        question: "Can I convert PNG logos to vector SVG?",
        answer: "Yes! The vectorizer mode traces high-contrast raster contours and generates genuine vector SVG paths.",
      },
      {
        question: "How do I export SVG at 2x or 3x Retina resolution?",
        answer: "Use the Retina scale multiplier in the SVG-to-raster tab to export PNG or JPG files at double or triple scale.",
      },
      {
        question: "Is SVG code cleaned before export?",
        answer: "Yes, our SVG optimizer removes unused attributes and whitespace to ensure clean, valid markup.",
      },
    ],
  },

  "image-resizer": {
    id: "image-resizer",
    name: "Online Image Resizer",
    category: "Editing",
    headline: "Resize Images to Exact Dimensions & Social Presets",
    subheadline:
      "Scale images with aspect ratio locking, pixel dimensions, percentage sliders, and ready-made social media presets.",
    steps: [
      {
        title: "1. Upload Your Image",
        desc: "Add your picture to inspect current dimensions, megapixel count, and aspect ratio.",
      },
      {
        title: "2. Set Dimensions or Preset",
        desc: "Type exact pixel widths/heights, choose a percentage scale (e.g. 50%), or pick an Instagram/YouTube preset.",
      },
      {
        title: "3. Apply & Download",
        desc: "Preview the resized result and download the scaled image in your preferred format.",
      },
    ],
    features: [
      {
        title: "Aspect Ratio Lock",
        desc: "Automatically calculate corresponding dimensions to prevent awkward distortion or stretching.",
      },
      {
        title: "Social Media Presets",
        desc: "Instant one-click sizing for Instagram posts (1080x1080), Stories (1080x1920), YouTube thumbnails, and banners.",
      },
      {
        title: "High-Quality Bicubic Resampling",
        desc: "Smooth pixel interpolation prevents jagged edges and preserves sharpness when scaling photos up or down.",
      },
      {
        title: "Batch Resizing",
        desc: "Scale multiple photos uniformly in a single batch to speed up content creation workflows.",
      },
    ],
    faqs: [
      {
        question: "Will resizing my image distort it?",
        answer: "Not if you keep the aspect ratio lock enabled, which automatically synchronizes width and height.",
      },
      {
        question: "What are the best image dimensions for social media?",
        answer: "Instagram Square is 1080x1080, Stories and Reels are 1080x1920, and YouTube thumbnails are 1280x720. Our presets configure these automatically.",
      },
      {
        question: "Can I resize by percentage instead of pixels?",
        answer: "Yes, switch to percentage mode to scale photos down by 25%, 50%, 75%, or any custom multiplier.",
      },
    ],
  },

  "image-cropper": {
    id: "image-cropper",
    name: "Online Image Cropper",
    category: "Editing",
    headline: "Crop Images with Custom Ratios, Zoom & Rule of Thirds",
    subheadline:
      "Precision visual cropping interface with interactive anchor handles, fixed aspect ratios (1:1, 16:9, 4:3), and alignment grids.",
    steps: [
      {
        title: "1. Upload Image",
        desc: "Upload any JPG, PNG, or WebP photo into the visual cropping canvas.",
      },
      {
        title: "2. Frame & Adjust",
        desc: "Drag the bounding box handles, select an aspect ratio constraint, and use the rule-of-thirds grid to compose the shot.",
      },
      {
        title: "3. Export Cropped Photo",
        desc: "Click 'Crop & Export' to render the clipped frame instantly at full native resolution.",
      },
    ],
    features: [
      {
        title: "Fixed & Freeform Ratios",
        desc: "Lock to standard 1:1 square, 16:9 widescreen, 4:3 classic, or crop freely with unconstrained handles.",
      },
      {
        title: "Rule of Thirds Overlay",
        desc: "Align key visual subjects with photographic grid guidelines for balanced, professional composition.",
      },
      {
        title: "Lossless Precision",
        desc: "Crops are calculated against the image's natural pixel grid so you never lose fidelity on uncropped areas.",
      },
      {
        title: "Instant Export",
        desc: "Save cropped photos directly to your hard drive without waiting for remote server processing.",
      },
    ],
    faqs: [
      {
        question: "Can I crop an image into an exact square for profile pictures?",
        answer: "Yes, select the 1:1 ratio preset to lock the cropping box to a perfect square.",
      },
      {
        question: "Does cropping reduce image resolution?",
        answer: "Cropping trims pixels outside the selected area, but inside the crop box, full original resolution is preserved.",
      },
      {
        question: "Can I zoom in before cropping?",
        answer: "Yes, use the zoom and pan controls to focus precisely on the subject of your photo.",
      },
    ],
  },

  "image-rotate-flip": {
    id: "image-rotate-flip",
    name: "Rotate & Flip Images Online",
    category: "Editing",
    headline: "Rotate 90°, 180° or Mirror Horizontally and Vertically",
    subheadline:
      "Fix sideways photos, mirror selfie portraits, or dial in custom arbitrary rotation angles with instantaneous canvas rendering.",
    steps: [
      {
        title: "1. Upload Sideways or Inverted Photos",
        desc: "Add single or multiple pictures requiring orientation corrections.",
      },
      {
        title: "2. Rotate or Flip",
        desc: "Click 90° Clockwise, 90° Counter-Clockwise, Flip Horizontal, or Flip Vertical.",
      },
      {
        title: "3. Download Clean Image",
        desc: "Export corrected images in your choice of PNG, JPG, or WebP format.",
      },
    ],
    features: [
      {
        title: "One-Click 90° & 180° Rotation",
        desc: "Instantly fix photos taken upside down or in landscape orientation on smartphones.",
      },
      {
        title: "Mirror Flip Horizontal & Vertical",
        desc: "Create mirrored reflections or correct reversed selfie camera shots.",
      },
      {
        title: "Arbitrary Angle Slider",
        desc: "Level horizons and straighten crooked scans with degree-by-degree rotational control.",
      },
      {
        title: "Batch Orientation Correction",
        desc: "Rotate entire photo shoots simultaneously to prepare galleries in seconds.",
      },
    ],
    faqs: [
      {
        question: "Why do my smartphone photos open sideways?",
        answer: "Smartphones store orientation tags in EXIF data that some software ignores. Rotating here re-encodes the image with permanent orientation.",
      },
      {
        question: "Does rotating an image decrease its quality?",
        answer: "Rotations in 90-degree increments are geometrically lossless on the canvas, preserving maximum image clarity.",
      },
      {
        question: "Can I flip an image horizontally like a mirror?",
        answer: "Yes, click 'Flip Horizontal' to mirror the image across the vertical axis.",
      },
    ],
  },

  "metadata": {
    id: "metadata",
    name: "EXIF & Metadata Viewer & Sanitizer",
    category: "Privacy & Meta",
    headline: "Inspect Camera Tags, Exposure & Strip GPS Location",
    subheadline:
      "Protect your personal privacy by inspecting and stripping hidden EXIF metadata, camera serial numbers, and GPS coordinates before sharing online.",
    steps: [
      {
        title: "1. Select Any Photo",
        desc: "Upload a JPEG or camera raw file to read embedded EXIF and TIFF headers.",
      },
      {
        title: "2. Inspect Metadata Tags",
        desc: "Review camera make, lens model, shutter speed, ISO, aperture, timestamp, and GPS coordinates on an interactive map.",
      },
      {
        title: "3. One-Click Strip & Sanitize",
        desc: "Click 'Sanitize & Strip' to remove every hidden metadata tag and download a clean, privacy-safe image.",
      },
    ],
    features: [
      {
        title: "GPS Location Protection",
        desc: "Ensure your home address, workplace, and personal coordinates are not exposed when uploading photos to public forums.",
      },
      {
        title: "Complete Camera Telemetry",
        desc: "Inspect professional photographic metrics: focal length, exposure time, F-number, flash mode, and color profiles.",
      },
      {
        title: "Zero-Trace Privacy",
        desc: "Metadata is analyzed in memory locally. Neither your image nor its coordinates are ever sent to external databases.",
      },
      {
        title: "One-Click Sanitization",
        desc: "Generate clean copies with all sensitive metadata stripped while keeping pixel quality intact.",
      },
    ],
    faqs: [
      {
        question: "What is EXIF metadata?",
        answer: "EXIF (Exchangeable Image File Format) is data embedded into photos by cameras and smartphones, often containing GPS coordinates, camera model, and capture date.",
      },
      {
        question: "Why should I strip metadata before sharing images online?",
        answer: "To protect your personal privacy. Photos taken on smartphones often contain the exact latitude and longitude of where you live or work.",
      },
      {
        question: "Does removing metadata reduce image quality?",
        answer: "No. Stripping metadata removes only text headers; the pixel data remains completely unaffected.",
      },
    ],
  },

  "image-to-pdf": {
    id: "image-to-pdf",
    name: "Image to PDF Converter",
    category: "Documents",
    headline: "Combine Images into a Single Professional PDF Document",
    subheadline:
      "Bundle multiple JPG, PNG, or WebP scans and photos into clean PDF documents with custom paper sizes, margins, and page ordering.",
    steps: [
      {
        title: "1. Add Images",
        desc: "Upload receipts, contract scans, or photo portfolios in any order.",
      },
      {
        title: "2. Configure Page Layout & Order",
        desc: "Choose standard paper sizes (A4, US Letter, Fit to Image), set margins, and drag pages to reorder.",
      },
      {
        title: "3. Generate PDF",
        desc: "Click 'Generate PDF' to compile everything into a single downloadable PDF document.",
      },
    ],
    features: [
      {
        title: "Standard Paper Sizes (A4, Letter, Fit)",
        desc: "Format scanned documents for standard office printing or let pages match each image's native aspect ratio.",
      },
      {
        title: "Drag & Drop Page Reordering",
        desc: "Arrange document pages in the exact sequence you want before generating the final PDF.",
      },
      {
        title: "Custom Margins & Alignment",
        desc: "Add clean borders, padding, and center images neatly on every page.",
      },
      {
        title: "100% Secure & In-Browser",
        desc: "Your confidential contracts, tax receipts, and IDs remain private on your computer without third-party server exposure.",
      },
    ],
    faqs: [
      {
        question: "Can I combine multiple photos into one PDF?",
        answer: "Yes, you can upload as many images as you need and combine them into a single multi-page PDF document.",
      },
      {
        question: "Which paper sizes are supported?",
        answer: "Docsy supports standard A4, US Letter, and a 'Fit to Image' mode that adjusts page dimensions to match the image exactly.",
      },
      {
        question: "Are my documents secure?",
        answer: "Completely. The PDF document is created directly in your browser using client-side JavaScript. No document data is transmitted online.",
      },
    ],
  },

  "pdf-to-image": {
    id: "pdf-to-image",
    name: "PDF to Image Converter",
    category: "Documents",
    headline: "Extract PDF Pages as High-Resolution PNG, JPG or WebP",
    subheadline:
      "Convert PDF document pages into high-fidelity image files with adjustable DPI rendering (up to 300 DPI) and batch ZIP download.",
    steps: [
      {
        title: "1. Upload Your PDF Document",
        desc: "Drop your PDF file into the converter to parse pages and thumbnails instantly.",
      },
      {
        title: "2. Select Resolution & Output Format",
        desc: "Pick your preferred image format (PNG, JPG, or WebP) and choose render quality (150 DPI for web, 300 DPI for print).",
      },
      {
        title: "3. Download Individual Pages or ZIP",
        desc: "Save individual pages as images or download all extracted pages in a single ZIP file.",
      },
    ],
    features: [
      {
        title: "High-DPI Rendering",
        desc: "Render PDF vector text and diagrams with ultra-crisp clarity at up to 300 DPI resolution.",
      },
      {
        title: "Selective Page Extraction",
        desc: "Preview page thumbnails and extract only the specific pages you need without converting the entire document.",
      },
      {
        title: "Transparent PNG Support",
        desc: "Extract graphics with transparent backgrounds where available, or solid white for standard document scans.",
      },
      {
        title: "Private Local Rendering",
        desc: "Powered by PDF.js running on your local device for maximum privacy and zero data leakage.",
      },
    ],
    faqs: [
      {
        question: "Can I convert password-protected PDFs?",
        answer: "If you have the password, you can unlock and render the pages directly in your browser.",
      },
      {
        question: "What is the best format for extracting PDF pages?",
        answer: "PNG is recommended for text and diagrams to prevent compression blur, while JPG or WebP is ideal for scanned photographs.",
      },
      {
        question: "Can I download all pages as a ZIP archive?",
        answer: "Yes, once pages are rendered, a single click will package and download all images in a convenient ZIP file.",
      },
    ],
  },

  "watermark": {
    id: "watermark",
    name: "Image Watermark Studio",
    category: "Editing",
    headline: "Add Text & Logo Watermarks to Protect Your Images",
    subheadline:
      "Brand your photography and prevent unauthorized image theft with custom text or transparent logo watermarks, tile patterns, and 9-anchor positioning.",
    steps: [
      {
        title: "1. Upload Base Images",
        desc: "Add your photos to the watermark editor.",
      },
      {
        title: "2. Customize Text or Logo",
        desc: "Type watermark text (e.g. copyright notice) or upload a logo PNG, adjust opacity, rotation, font size, and choose placement.",
      },
      {
        title: "3. Apply & Download",
        desc: "Preview the watermarked result live on the canvas and download protected images instantly.",
      },
    ],
    features: [
      {
        title: "Text & PNG Logo Watermarks",
        desc: "Overlay custom copyright text or transparent brand marks with full control over opacity, scale, and angle.",
      },
      {
        title: "9-Point Anchor & Tile Patterns",
        desc: "Place your mark at any corner, center, or repeat across the entire canvas in a secure diagonal tile pattern.",
      },
      {
        title: "Batch Watermarking",
        desc: "Watermark an entire portfolio or product catalog simultaneously with identical styling.",
      },
      {
        title: "Client-Side Speed",
        desc: "Fast canvas composition means hundreds of photos can be watermarked in seconds without uploading large files.",
      },
    ],
    faqs: [
      {
        question: "Can I use a transparent PNG logo as a watermark?",
        answer: "Yes, you can upload transparent PNG logos and adjust their size, opacity, and positioning.",
      },
      {
        question: "What is the tile watermark mode?",
        answer: "Tile mode repeats your watermark diagonally across the entire image to prevent easy cropping or removal.",
      },
      {
        question: "Will watermarking degrade my original photo quality?",
        answer: "No, watermarks are composited on the canvas at full original resolution.",
      },
    ],
  },

  "background": {
    id: "background",
    name: "Background Keyer & Color Replacer",
    category: "Editing",
    headline: "Remove or Replace Uniform Background Colors Online",
    subheadline:
      "Isolate product photos, remove solid studio backgrounds with the color eyedropper, and export clean transparent PNGs.",
    steps: [
      {
        title: "1. Upload Photo",
        desc: "Select an image with a solid, studio, or high-contrast background.",
      },
      {
        title: "2. Sample Background Color",
        desc: "Click the eyedropper to sample the background color and adjust tolerance and feather sliders.",
      },
      {
        title: "3. Export Transparent PNG",
        desc: "Preview the transparent cutout or replace it with another solid color, then download the isolated image.",
      },
    ],
    features: [
      {
        title: "Precision Eyedropper Sampler",
        desc: "Click anywhere on the image preview to sample exact background RGB values.",
      },
      {
        title: "Tolerance & Edge Feathering",
        desc: "Smoothly transition around tricky borders, hair, and soft edges without harsh jagged cutoffs.",
      },
      {
        title: "Transparent PNG Export",
        desc: "Create transparent alpha-channel cutouts ready for e-commerce listings, banners, and marketing collaterals.",
      },
      {
        title: "Color Replacement",
        desc: "Swap unwanted white or grey backgrounds with vibrant brand colors in real time.",
      },
    ],
    faqs: [
      {
        question: "Does this tool work best on solid backgrounds?",
        answer: "Yes, chroma keying and color delta algorithms are optimized for solid, studio, or high-contrast backgrounds.",
      },
      {
        question: "Can I download the output with a transparent background?",
        answer: "Yes, choose 'Transparent' mode to export an alpha-channel PNG.",
      },
      {
        question: "What does the tolerance slider do?",
        answer: "Tolerance controls how similar a color must be to the sampled background color to be removed. Higher values remove more variation.",
      },
    ],
  },

  "base64": {
    id: "base64",
    name: "Base64 Image Encoder & Decoder",
    category: "Developer Tools",
    headline: "Convert Images to Base64 Data URIs & Decode Strings to Files",
    subheadline:
      "Encode images into Base64 Data URIs, HTML <img> tags, and CSS background snippets, or paste raw Base64 strings to decode back into image files.",
    steps: [
      {
        title: "1. Upload Image or Paste String",
        desc: "Drop an image to encode into Base64, or paste an existing Base64 Data URI to decode.",
      },
      {
        title: "2. Select Code Output Snippet",
        desc: "Choose between raw Data URI, HTML <img> tag, or CSS background-image snippet with one-click copy.",
      },
      {
        title: "3. Copy Code or Save File",
        desc: "Copy formatted snippet to your clipboard or download decoded images directly to your drive.",
      },
    ],
    features: [
      {
        title: "Full Data URI Generation",
        desc: "Produces valid RFC 2397 Data URIs including correct MIME types (image/png, image/jpeg, image/svg+xml, etc.).",
      },
      {
        title: "Ready-to-Use Code Snippets",
        desc: "Generates copy-paste HTML <img> tags, CSS background-image rules, and JSON strings.",
      },
      {
        title: "Bidirectional Encoding & Decoding",
        desc: "Easily inspect Base64 strings by visualizing them instantly in the browser canvas.",
      },
      {
        title: "Zero Remote Calls",
        desc: "Enables instant encoding of sensitive API assets, icons, and test fixtures without network latency.",
      },
    ],
    faqs: [
      {
        question: "What is a Base64 Data URI?",
        answer: "A Base64 Data URI embeds binary image data directly as text within HTML or CSS, eliminating separate HTTP image requests.",
      },
      {
        question: "When should I use Base64 images?",
        answer: "Base64 is ideal for small icons, avatars, and inline email signatures to avoid additional network requests.",
      },
      {
        question: "Can this tool decode a Base64 string back into an image?",
        answer: "Yes, switch to the decoder tab, paste your string, and you can preview and download the reconstructed image file.",
      },
    ],
  },

  "image-info": {
    id: "image-info",
    name: "Image Info & Color Palette Inspector",
    category: "Analysis & Meta",
    headline: "Inspect Pixel Dimensions, Megapixels & Extract Color Palettes",
    subheadline:
      "Deep-dive into image properties: inspect natural width, height, aspect ratio, transparency channel, and extract dominant hex color palettes.",
    steps: [
      {
        title: "1. Upload Any Image",
        desc: "Drop an image to run instantaneous canvas pixel analysis.",
      },
      {
        title: "2. View Technical Metrics",
        desc: "Review megapixels, exact aspect ratio, file size, color depth, and alpha transparency.",
      },
      {
        title: "3. Copy Dominant Hex Colors",
        desc: "Click any swatch in the extracted color palette to copy its HEX or RGB code to your clipboard.",
      },
    ],
    features: [
      {
        title: "Dominant Color Palette Extraction",
        desc: "Smart color quantization analyzes the image to extract its primary and secondary brand colors with one-click hex copying.",
      },
      {
        title: "Pixel Aspect Ratio & Megapixels",
        desc: "Calculate precise aspect ratios (e.g. 16:9, 4:3, 1:1) and exact sensor megapixel counts.",
      },
      {
        title: "Alpha Transparency Detection",
        desc: "Instantly check whether an image contains semi-transparent pixels or full opacity.",
      },
      {
        title: "Direct Action Shortcuts",
        desc: "Jump straight into compression, resizing, or conversion with your analyzed file ready to go.",
      },
    ],
    faqs: [
      {
        question: "How does palette extraction work?",
        answer: "The tool samples pixel colors using canvas clustering algorithms to identify the most visually prominent tones in the photo.",
      },
      {
        question: "Can I copy hex codes directly from the palette?",
        answer: "Yes, simply click on any color swatch to copy its hexadecimal color code to your clipboard.",
      },
      {
        question: "Does this inspect TIFF and raw files?",
        answer: "It inspects all web-supported formats including PNG, JPG, WebP, AVIF, SVG, and GIF.",
      },
    ],
  },

  "favicon-generator": {
    id: "favicon-generator",
    name: "Favicon & App Icon Generator",
    category: "Developer Tools",
    headline: "Generate Multi-Size Favicon.ico, Apple Touch & Web Manifest",
    subheadline:
      "Turn any logo or square artwork into a complete modern favicon suite: multi-resolution favicon.ico (16/32/48px), Apple Touch icons, Android Chrome icons, and site.webmanifest in one ZIP bundle.",
    steps: [
      {
        title: "1. Upload Your Square Logo",
        desc: "Upload a high-resolution PNG, SVG, or JPG logo (at least 512x512 recommended).",
      },
      {
        title: "2. Preview Across Sizes & Devices",
        desc: "Preview browser tab rendering, bookmark icons, and mobile home screen tiles.",
      },
      {
        title: "3. Download 1-Click ZIP Package",
        desc: "Download the complete bundle with favicon.ico, PNG icons, site.webmanifest, and ready-to-paste HTML code.",
      },
    ],
    features: [
      {
        title: "Multi-Resolution favicon.ico",
        desc: "True embedded multi-resolution binary ICO container containing 16x16, 32x32, and 48x48 pixel icons.",
      },
      {
        title: "Apple Touch & Mobile Icons",
        desc: "Includes 180x180 Apple Touch Icon, and 192x192 & 512x512 Android PWA app icons.",
      },
      {
        title: "Auto site.webmanifest",
        desc: "Pre-configured manifest file ready to drop into your public web root directory.",
      },
      {
        title: "Copy-Paste HTML <head> Tags",
        desc: "Get all necessary `<link rel='icon'>` tags formatted and ready to paste directly into your site layout.",
      },
    ],
    faqs: [
      {
        question: "What sizes are included in the favicon.ico file?",
        answer: "Our favicon generator embeds 16x16, 32x32, and 48x48 pixel bitmaps inside a single standard ICO container for full browser compatibility.",
      },
      {
        question: "What is an Apple Touch Icon?",
        answer: "It is the 180x180 PNG graphic used by iOS devices when a user adds your website to their iPhone or iPad home screen.",
      },
      {
        question: "Is the generated ZIP file ready for production?",
        answer: "Yes, extract the contents into your website's root or public directory and paste the generated HTML snippet into your `<head>` tags.",
      },
    ],
  },

  "svg-viewer": {
    id: "svg-viewer",
    name: "SVG Viewer & Live Code Editor",
    category: "Developer Tools",
    headline: "Live SVG Editor, Markup Inspector & Color Swapper",
    subheadline:
      "Paste SVG code directly, inspect viewBox and element trees, tweak colors live, validate syntax, and export as optimized SVG, high-res PNG, or React JSX.",
    steps: [
      {
        title: "1. Paste Code or Upload SVG",
        desc: "Paste raw SVG XML markup into the code editor or drop an existing SVG file.",
      },
      {
        title: "2. Live Preview & Color Tweaking",
        desc: "Inspect live rendering, detect the color palette, and swap fills/strokes interactively.",
      },
      {
        title: "3. Save as SVG, PNG or JSX",
        desc: "Format and copy sanitized SVG XML, export hi-res raster PNGs (1x to 4x), or copy React JSX code.",
      },
    ],
    features: [
      {
        title: "Live Code Split-Screen Editor",
        desc: "Edit SVG coordinates and attributes with instant live canvas preview.",
      },
      {
        title: "Interactive Color Swapper",
        desc: "Automatically detects all fill and stroke hex colors in the document for instant one-click theme swapping.",
      },
      {
        title: "React JSX Exporter",
        desc: "Convert raw SVG attributes (e.g. stroke-width, class) into camelCase React JSX properties with one click.",
      },
      {
        title: "Multi-Scale PNG Rasterization",
        desc: "Render vector illustrations to 1x, 2x, 3x, or 4x Retina PNG files with transparent backgrounds.",
      },
    ],
    faqs: [
      {
        question: "Can I paste raw SVG code directly?",
        answer: "Yes! Paste any SVG code string into the editor to inspect, preview, and modify it immediately.",
      },
      {
        question: "How do I convert SVG to React JSX?",
        answer: "Click the 'Copy JSX' button in the toolbar to receive clean, camelCased JSX markup ready for your React or Next.js components.",
      },
      {
        question: "Can I export SVG as a transparent PNG?",
        answer: "Yes, select PNG format and pick your desired scale multiplier (1x to 4x) to download a high-resolution transparent image.",
      },
    ],
  },
};
