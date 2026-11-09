import type { Metadata } from "next";
import PdfToImageClient from "./PdfToImageClient";

export const metadata: Metadata = {
  title: "Free PDF to Image Converter Online — Extract PNG, JPG & WebP",
  description:
    "Convert PDF pages into PNG, JPG, or WebP images directly in your browser. Download individual pages or export all pages as a ZIP archive.",
  alternates: {
    canonical: "/tools/pdf-to-image",
  },
  openGraph: {
    title: "Free PDF to Image Converter Online — Extract PNG, JPG & WebP",
    description:
      "Convert PDF pages into PNG, JPG, or WebP images directly in your browser. Download individual pages or export all pages as a ZIP archive.",
    url: "/tools/pdf-to-image",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Docsy — Free Online Image Tools",
      },
    ],
  },
  keywords: [
    "pdf to image",
    "pdf to png",
    "pdf to jpg",
    "extract pdf pages",
    "convert pdf to picture",
    "pdf page extractor",
  ],
};

export default function PdfToImagePage() {
  return <PdfToImageClient />;
}