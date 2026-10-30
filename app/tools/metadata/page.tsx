import type { Metadata } from "next";
import MetadataClient from "./MetadataClient";

export const metadata: Metadata = {
  title: "View & Remove EXIF Metadata Online — Camera, GPS & Privacy Tool",
  description:
    "View detailed EXIF metadata, camera settings, exposure, and GPS location tags. Strip all metadata in one click to protect your privacy before sharing.",
  alternates: {
    canonical: "/tools/metadata",
  },
  openGraph: {
    title: "View & Remove EXIF Metadata Online — Camera, GPS & Privacy Tool",
    description:
      "View detailed EXIF metadata, camera settings, exposure, and GPS location tags. Strip all metadata in one click to protect your privacy before sharing.",
    url: "/tools/metadata",
  },
  keywords: [
    "exif viewer",
    "remove exif online",
    "strip metadata",
    "photo exif reader",
    "remove gps from photo",
    "privacy image sanitizer",
  ],
};

export default function MetadataPage() {
  return <MetadataClient />;
}
