import type { Metadata } from "next";
import BackgroundClient from "./BackgroundClient";

export const metadata: Metadata = {
  title: "Image Background Tools — Color Key & Background Replacement",
  description:
    "Remove or replace uniform background colors in your photos. Use the eyedropper tool to pick any background color and replace with transparency or solid colors.",
  alternates: {
    canonical: "/tools/background",
  },
  openGraph: {
    title: "Image Background Tools — Color Key & Background Replacement",
    description:
      "Remove or replace uniform background colors in your photos. Use the eyedropper tool to pick any background color and replace with transparency or solid colors.",
    url: "/tools/background",
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
