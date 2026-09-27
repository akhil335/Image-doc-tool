import type { Metadata } from "next";
import ImageInfoClient from "./ImageInfoClient";

export const metadata: Metadata = {
  title: "Image Information & Color Palette Extractor Online",
  description:
    "Inspect comprehensive technical details about your images: dimensions, megapixels, aspect ratios, alpha channel, and extract dominant color palette with hex codes.",
  keywords: [
    "image information",
    "image inspector",
    "extract color palette",
    "image aspect ratio calculator",
    "image megapixels",
    "hex colors from image",
  ],
};

export default function ImageInfoPage() {
  return <ImageInfoClient />;
}
