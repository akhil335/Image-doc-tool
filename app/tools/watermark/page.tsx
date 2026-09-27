import type { Metadata } from "next";
import WatermarkClient from "./WatermarkClient";

export const metadata: Metadata = {
  title: "Add Watermark to Images Online — Text & Logo Watermarking",
  description:
    "Add custom text or logo watermarks to single or batch images online. Control placement, opacity, rotation, and tile patterns directly in your browser.",
  keywords: [
    "image watermark",
    "watermark photos online",
    "add logo to photo",
    "text watermark online",
    "batch watermark",
    "copyright photo tool",
  ],
};

export default function WatermarkPage() {
  return <WatermarkClient />;
}
