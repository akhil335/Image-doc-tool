import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  return [
    {
      url: baseUrl,
    },
    {
      url: `${baseUrl}/tools/image-to-pdf`,
    },
    {
      url: `${baseUrl}/tools/pdf-to-image`,
    },
  ];
}