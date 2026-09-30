import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider, useTheme } from "@context/ThemeContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.docsy.tech"),

  title: { default: "Docsy — All-in-One Image Tools", template: "%s | Docsy", },

  description:
    "Fast, private, client-side image processing. Convert, compress, resize, optimize, and vectorize images directly in your browser. Zero server uploads.",

  keywords: [
    "image laboratory",
    "image compressor",
    "image converter",
    "svg vectorizer",
    "image resizer",
    "client-side image tools",
    "private image processing",
    "browser image tools",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Docsy — Free Online Image Tools",
    description:
      "Transform your images with Docsy. Convert, compress, resize, crop, and optimize images quickly and easily, right in your browser.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.docsy.tech",
    siteName: "Docsy",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1114,
        height: 326,
        alt: "Docsy — Free Online Image Tools",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Docsy — Free Online Image Tools",
    description:
      "Convert, compress, resize, crop, and optimize images quickly and easily with Docsy.",
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
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>

      <body className="font-sans antialiased selection:bg-accent/20 selection:text-text min-h-screen flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
