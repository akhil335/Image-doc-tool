import type { Metadata } from "next";
import SvgViewerClient from "./SvgViewerClient";

export const metadata: Metadata = {
  title: "Free SVG Viewer & Live Editor Online — Edit, Inspect & Save SVG Markup",
  description:
    "Interactive SVG viewer and live code editor in your browser. Paste raw SVG code directly, inspect viewBox and elements, tweak colors, format or minify XML, and save as SVG, PNG, or React JSX.",
  keywords: [
    "svg viewer",
    "svg editor",
    "edit svg online",
    "svg code editor",
    "paste svg code",
    "svg preview",
    "save svg",
    "svg to png converter",
    "format svg xml",
    "svg color changer",
    "svg to jsx",
  ],
};

export default function SvgViewerPage() {
  return <SvgViewerClient />;
}
