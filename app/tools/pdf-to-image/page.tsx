import type { Metadata } from "next";

import PdfToImageClient from "./PdfToImageClient";

export const metadata: Metadata = {
  title: "PDF to Image Converter",
  description:
    "Convert PDF pages into PNG or JPG images directly in your browser. Download individual pages or all pages as a ZIP file.",
};

export default function PdfToImagePage() {
  return <PdfToImageClient />;
}