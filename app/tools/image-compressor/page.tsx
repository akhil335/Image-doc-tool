import type { Metadata } from "next";
import ImageCompressorClient from "./ImageCompressorClient";

export const metadata: Metadata = {
  title: "Free Image Compressor Online — Shrink JPG, PNG, WebP & AVIF",
  description:
    "Compress images online without quality loss. Reduce file size up to 80% directly in your browser. Features live before/after comparison and batch export.",
  keywords: [
    "image compressor",
    "compress jpg",
    "compress png",
    "compress webp",
    "reduce image file size",
    "batch image compressor",
    "photo size reducer",
  ],
};

export default function ImageCompressorPage() {
  return <ImageCompressorClient />;
}
