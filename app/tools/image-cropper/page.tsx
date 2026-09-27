import type { Metadata } from "next";
import ImageCropperClient from "./ImageCropperClient";

export const metadata: Metadata = {
  title: "Free Image Cropper Online — Aspect Ratios, Zoom & Rotate",
  description:
    "Crop images online with interactive handles, custom and fixed aspect ratios (1:1, 16:9, 4:3, 9:16), rule-of-thirds grid, and live preview.",
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
