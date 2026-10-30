import type { Metadata } from "next";
import ImageRotateFlipClient from "./ImageRotateFlipClient";

export const metadata: Metadata = {
  title: "Rotate and Flip Image Online — 90°, 180°, Mirror Horizontal & Vertical",
  description:
    "Rotate and flip images online directly in your browser. Rotate clockwise, counter-clockwise, mirror horizontally or vertically. Batch download with instant canvas processing.",
  alternates: {
    canonical: "/tools/image-rotate-flip",
  },
  openGraph: {
    title: "Rotate and Flip Image Online — 90°, 180°, Mirror Horizontal & Vertical",
    description:
      "Rotate and flip images online directly in your browser. Rotate clockwise, counter-clockwise, mirror horizontally or vertically. Batch download with instant canvas processing.",
    url: "/tools/image-rotate-flip",
  },
  keywords: [
    "rotate image",
    "flip image",
    "mirror image online",
    "rotate photo 90 degrees",
    "flip photo horizontally",
  ],
};

export default function ImageRotateFlipPage() {
  return <ImageRotateFlipClient />;
}
