import type { Metadata } from "next";
import BackgroundClient from "./BackgroundClient";

export const metadata: Metadata = {
  title: "Image Background Tools — Color Key & Background Replacement",
  description:
    "Remove or replace uniform background colors in your photos. Use the eyedropper tool to pick any background color and replace with transparency or solid colors.",
  keywords: [
    "background replacement",
    "remove background color",
    "chroma key online",
    "transparent png maker",
    "change photo background color",
    "color key tool",
  ],
};

export default function BackgroundPage() {
  return <BackgroundClient />;
}
