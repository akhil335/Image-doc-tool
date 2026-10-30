import type { Metadata } from "next";
import ImageToPdfClient from "./ImageToPdfClient";

export const metadata: Metadata = {
  title: "Free Image to PDF Converter Online — Combine Photos into PDF",
  description:
    "Convert JPG, PNG, and WebP images into PDF pages directly in your browser. Reorder images, customize page size (A4, Letter), and download your PDF instantly.",
  alternates: {
    canonical: "/tools/image-to-pdf",
  },
  openGraph: {
    title: "Free Image to PDF Converter Online — Combine Photos into PDF",
    description:
      "Convert JPG, PNG, and WebP images into PDF pages directly in your browser. Reorder images, customize page size (A4, Letter), and download your PDF instantly.",
    url: "/tools/image-to-pdf",
  },
  keywords: [
    "image to pdf",
    "jpg to pdf",
    "png to pdf",
    "combine photos into pdf",
    "convert pictures to pdf",
    "free pdf maker online",
  ],
};

export default function ImageToPdfPage() {
  return <ImageToPdfClient />;
}