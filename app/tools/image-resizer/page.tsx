import type { Metadata } from "next";
import ImageResizerClient from "./ImageResizerClient";

export const metadata: Metadata = {
  title: "Free Image Resizer Online — Dimensions, Percent & Presets",
  description:
    "Resize images online to custom dimensions, percentages, or social media presets (1080p, Instagram, Story). Features aspect ratio locking and batch processing.",
  keywords: [
    "image resizer",
    "resize image online",
    "resize photo",
    "instagram image resizer",
    "batch resize images",
    "scale image",
  ],
};

export default function ImageResizerPage() {
  return <ImageResizerClient />;
}
