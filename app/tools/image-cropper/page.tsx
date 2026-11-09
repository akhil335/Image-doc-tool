import type { Metadata } from "next";
import ImageCropperClient from "./ImageCropperClient";

export const metadata: Metadata = {
  title: "Free Image Cropper Online — Aspect Ratios, Zoom & Rotate",
  description:
    "Crop images online with interactive handles, custom and fixed aspect ratios (1:1, 16:9, 4:3, 9:16), rule-of-thirds grid, and live preview.",
  alternates: {
    canonical: "/tools/image-cropper",
  },
  openGraph: {
    title: "Free Image Cropper Online — Aspect Ratios, Zoom & Rotate",
    description:
      "Crop images online with interactive handles, custom and fixed aspect ratios (1:1, 16:9, 4:3, 9:16), rule-of-thirds grid, and live preview.",
    url: "/tools/image-cropper",
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
    "image cropper",
    "crop photo online",
    "square image crop",
    "16:9 photo crop",
    "online crop tool",
    "crop picture",
  ],
};

export default function ImageCropperPage() {
  return <ImageCropperClient />;
}
