import type { Metadata } from "next";
import ImageToPdfClient from "./ImageToPdfClient";

export const metadata: Metadata = {
  title: "Image to PDF Converter",
  description:
    "Convert JPG and PNG images into PDF pages directly in your browser. Reorder images and download your PDF instantly.",
};

export default function ImageToPdfPage() {
  return <ImageToPdfClient />;
}