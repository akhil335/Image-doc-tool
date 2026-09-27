import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/toolsRegistry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://docforge.dev";

  const toolRoutes = TOOLS.map((t) => ({
    url: `${baseUrl}${t.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: t.popular ? 0.9 : 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    ...toolRoutes,
  ];
}