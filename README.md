# DocForge — Phase 1

A small Next.js (App Router + TypeScript + Tailwind) tool site for converting
between images and PDFs. Everything runs client-side in the browser — no
backend, no file uploads.

## Live in Phase 1

- **Image → PDF** (`/tools/image-to-pdf`): queue up JPG/PNG images, reorder
  them, choose "fit to image", A4, or Letter page sizing, and export a single
  PDF (via `pdf-lib`).
- **PDF → Image** (`/tools/pdf-to-image`): upload a PDF, render every page to
  PNG or JPG at a chosen quality (via `pdfjs-dist`), download pages
  individually or all at once as a `.zip` (via `jszip`).

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/
  page.tsx                     home page (hero + tool cards + phase 2 teaser)
  tools/image-to-pdf/page.tsx  image → pdf tool UI
  tools/pdf-to-image/page.tsx  pdf → image tool UI
components/
  Header.tsx, Footer.tsx, Dropzone.tsx
lib/
  imageToPdf.ts                pdf-lib based conversion logic
  pdfToImages.ts                pdfjs-dist based conversion logic
```

Conversion logic lives in `lib/`, separate from the page UI, so it's easy to
reuse when phase 2 features are added.

## Planned for Phase 2

- **Image compression** — reduce file size with a quality slider.
- **Background removal / replacement** — cut out a subject and swap the
  background.

Suggested approach when you build these: add a new folder under
`app/tools/<feature-name>/`, a matching helper in `lib/`, and a new card in
`app/page.tsx`'s `liveTools` array (moving it out of `upcoming`). Background
removal will likely need a model running either via `onnxruntime-web` in the
browser (keeps everything client-side) or a small API route if you'd rather
run it server-side — worth deciding that early since it affects whether the
site can stay a fully static export.

## Deployment

This is a standard Next.js app — deploys as-is to Vercel, or run
`npm run build && npm start` anywhere that supports Node.
