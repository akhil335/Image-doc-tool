import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Docsy — All-in-One Free Image Tools | Fast, Private & In-Browser",
  description:
    "Fast, private, client-side image processing. Convert, compress, resize, crop, optimize, and vectorize images directly in your browser. Zero server uploads.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Docsy — All-in-One Free Image Tools | Fast, Private & In-Browser",
    description:
      "Transform your images with Docsy. Convert, compress, resize, crop, and optimize images quickly and easily, right in your browser.",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Docsy — All-in-One Free Image Tools | Fast, Private & In-Browser",
      },
    ],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
