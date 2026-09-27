import type { Metadata } from "next";
import ImageConverterClient from "./ImageConverterClient";

export const metadata: Metadata = {
  title: "Free Image Converter Online — PNG, JPG, WebP, AVIF, BMP",
  description:
    "Convert single or batch images between PNG, JPG, WebP, AVIF, and BMP format directly in your browser. Fast, private, and high fidelity.",
  keywords: [
    "image converter",
    "png to jpg",
    "jpg to webp",
    "webp to png",
    "avif converter",
    "batch image converter",
    "online image converter",
  ],
};

export default function ImageConverterPage() {
  return <ImageConverterClient />;
}
