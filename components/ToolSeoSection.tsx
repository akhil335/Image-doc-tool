import Link from "next/link";
import { TOOL_SEO_DATA } from "@/lib/toolSeoData";
import { TOOLS } from "@/lib/toolsRegistry";

interface ToolSeoSectionProps {
  toolId: string;
}

export default function ToolSeoSection({ toolId }: ToolSeoSectionProps) {
  const data = TOOL_SEO_DATA[toolId];
  if (!data) return null;

  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.docsy.tech";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const canonicalUrl = `${baseUrl}/tools/${data.id}`;

  // Other related tools for internal linking
  const relatedTools = TOOLS.filter((t) => t.id !== toolId).slice(0, 4);

  // Schema.org structured data (WebApplication + FAQPage)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${canonicalUrl}#software`,
        name: data.name,
        url: canonicalUrl,
        applicationCategory: "DesignApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        description: data.subheadline,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: data.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <section className="mt-16 pt-12 border-t border-border/70 text-text max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Section 1: How It Works */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="font-mono text-[11px] font-semibold text-accent tracking-wider uppercase">
            Quick Workflow
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
            How to Use the {data.name}
          </h2>
          <p className="text-[14px] text-muted max-w-lg mx-auto">
            Process your images with three simple steps right in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {data.steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface p-5 space-y-2 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2 font-mono text-[12px] font-bold text-accent">
                <span className="h-6 w-6 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>STEP {idx + 1}</span>
              </div>
              <h3 className="font-sans font-semibold text-[15px] text-text pt-1">
                {step.title.replace(/^\d+\.\s*/, "")}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Key Capabilities & Privacy */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="font-mono text-[11px] font-semibold text-accent tracking-wider uppercase">
            Engineered for Performance
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
            {data.headline}
          </h2>
          <p className="text-[14px] text-muted max-w-xl mx-auto leading-relaxed">
            {data.subheadline}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {data.features.map((feat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/80 bg-surface/60 p-5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <h3 className="font-sans font-semibold text-[14px] text-text">
                  {feat.title}
                </h3>
              </div>
              <p className="text-[13px] text-muted leading-relaxed pl-4">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Frequently Asked Questions */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="font-mono text-[11px] font-semibold text-accent tracking-wider uppercase">
            Got Questions?
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[14px] text-muted max-w-lg mx-auto">
            Everything you need to know about processing images with Docsy.
          </p>
        </div>

        <div className="divide-y divide-border/60 rounded-xl border border-border bg-surface">
          {data.faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group p-5 first:rounded-t-xl last:rounded-b-xl transition-colors open:bg-surface-hover/30"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-[14px] text-text hover:text-accent transition-colors">
                <span>{faq.question}</span>
                <span className="ml-4 font-mono text-[16px] text-muted group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[13px] text-muted leading-relaxed pr-6">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Section 4: Internal Links to Other Tools */}
      <div className="space-y-4 pt-4 pb-8">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[12px] font-semibold text-muted uppercase tracking-wider">
            Explore More Free Image Tools
          </h3>
          <Link
            href="/"
            className="text-[12px] text-accent hover:underline font-mono"
          >
            View All 15 Tools →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {relatedTools.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="rounded-lg border border-border bg-surface p-3 hover:border-accent/40 hover:bg-surface-hover transition-colors group"
            >
              <p className="font-sans font-medium text-[13px] text-text group-hover:text-accent transition-colors truncate">
                {t.title}
              </p>
              <p className="font-mono text-[10px] text-muted truncate mt-0.5">
                {t.metricsLabel || t.category}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
