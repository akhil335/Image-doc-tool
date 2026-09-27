import type { Metadata } from "next";
import Base64Client from "./Base64Client";

export const metadata: Metadata = {
  title: "Base64 Image Converter — Encode & Decode Images Online",
  description:
    "Convert images to Base64 data URIs, HTML tags, and CSS snippets, or decode Base64 strings back into downloadable image files directly in your browser.",
  keywords: [
    "image to base64",
    "base64 to image",
    "base64 image decoder",
    "data uri generator",
    "base64 string to png",
    "online base64 image",
  ],
};

export default function Base64Page() {
  return <Base64Client />;
}
