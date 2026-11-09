import type { Metadata } from "next";
import ImageConverterClient from "./ImageConverterClient";

export const metadata: Metadata = {
  title: "Free Image Converter Online — PNG, JPG, WebP, AVIF, BMP",
  description:
    "Convert single or batch images between PNG, JPG, WebP, AVIF, and BMP format directly in your browser. Fast, private, and high fidelity.",
  alternates: {
    canonical: "/tools/image-converter",
  },
  openGraph: {
    title: "Free Image Converter Online — PNG, JPG, WebP, AVIF, BMP",
    description:
      "Convert single or batch images between PNG, JPG, WebP, AVIF, and BMP format directly in your browser. Fast, private, and high fidelity.",
    url: "/tools/image-converter",
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
