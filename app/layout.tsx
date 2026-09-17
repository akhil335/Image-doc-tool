import type { Metadata } from "next";

import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

  title: {
    default: "DocForge — Image & PDF Converter",
    template: "%s | DocForge",
  },

  description:
    "Convert images to PDF and PDF pages to images directly in your browser. No uploads, no waiting.",

  keywords: [
    "image to PDF",
    "PDF to image",
    "image converter",
    "PDF converter",
    "online PDF converter",
    "browser PDF converter",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "DocForge — Image & PDF Converter",
    description:
      "Convert images to PDF and PDF pages to images directly in your browser. No uploads, no waiting.",
    url: process.env.NEXT_PUBLIC_SITE_URL!,
    siteName: "DocForge",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 512,
        height: 512,
        alt: "DocForge — Image & PDF Converter",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "DocForge — Image & PDF Converter",
    description:
      "Convert images to PDF and PDF pages to images directly in your browser.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>

      <body className="font-sans antialiased">
        {children}
         <SpeedInsights />
      </body>
    </html>
  );
}