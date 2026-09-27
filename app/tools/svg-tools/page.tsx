import type { Metadata } from "next";
import SvgToolsClient from "./SvgToolsClient";

export const metadata: Metadata = {
  title: "SVG Tools Online — Convert, Optimize & True Vectorize",
  description:
    "Convert SVG to PNG, JPG, or WebP at any resolution, optimize SVG markup to reduce file size, or convert raster images into genuine vector SVG paths.",
  keywords: [
    "svg to png",
    "svg converter",
    "svg optimizer",
    "image to svg",
    "raster to vector",
    "vectorizer online",
    "svg code viewer",
  ],
};

export default function SvgToolsPage() {
  return <SvgToolsClient />;
}
