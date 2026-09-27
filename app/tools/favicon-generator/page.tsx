import type { Metadata } from "next";
import FaviconGeneratorClient from "./FaviconGeneratorClient";

export const metadata: Metadata = {
  title: "Free Favicon Generator & Package Creator Online — ICO, PNG, WebManifest ZIP",
  description:
    "Convert any image or logo into a complete, production-ready favicon package. Generates multi-resolution favicon.ico (16/32/48px), Apple Touch icons, Android Chrome icons, site.webmanifest, and HTML head snippet, downloadable as a ZIP.",
  keywords: [
    "favicon generator",
    "favicon converter",
    "png to ico",
    "image to favicon",
    "apple touch icon",
    "android chrome icon",
    "site.webmanifest generator",
    "favicon zip download",
    "favicon maker online",
  ],
};

export default function FaviconGeneratorPage() {
  return <FaviconGeneratorClient />;
}
