import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const liveTools = [
  {
    href: "/tools/image-to-pdf",
    tag: "01",
    title: "Image → PDF",
    desc: "Drop in JPGs or PNGs, reorder them, and bundle them into a single PDF.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="13" height="10" rx="1.5" />
        <path d="m3 12 3.5-3.5L10 12l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
        <path d="M18 9v10a1.5 1.5 0 0 1-1.5 1.5H9" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/tools/pdf-to-image",
    tag: "02",
    title: "PDF → Image",
    desc: "Pull every page out of a PDF as a standalone PNG or JPG, downloaded as a zip.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M8 3.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-8.5A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5Z" />
        <path d="M14 3.5V8h4" strokeLinejoin="round" />
        <rect x="9" y="11.5" width="6" height="5" rx="1" />
        <path d="m10 16 1.5-2 1 1.2 1.5-2 1 1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const upcoming = [
  {
    tag: "03",
    title: "Image compression",
    desc: "Shrink file size while keeping images sharp enough to still look intentional.",
  },
  {
    tag: "04",
    title: "Background removal",
    desc: "Cut a subject out cleanly and swap in a new backdrop or transparency.",
  },
];

const steps = [
  {
    n: "1",
    title: "Add your files",
    desc: "Drag them in or click to browse. Nothing leaves your device.",
  },
  {
    n: "2",
    title: "Set the options",
    desc: "Reorder pages, pick a page size, or choose an export format.",
  },
  {
    n: "3",
    title: "Download",
    desc: "Get your file instantly — no waiting on an upload or a queue.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="grain border-b border-border">
          <div className="mx-auto grid max-w-5xl gap-10 px-6 py-20 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
                a small workshop for files
              </p>
              <h1 className="mt-4 max-w-lg font-display text-5xl font-medium leading-[1.08] text-text">
                Turn images into documents, and documents back into images.
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
                Two tools live today. Everything runs in your browser — pick a
                file, and it never leaves your machine.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/tools/image-to-pdf"
                  className="focus-ring rounded-sm bg-accent px-5 py-2.5 font-mono text-[13px] text-white transition-colors hover:bg-accent-strong"
                >
                  start converting
                </Link>
                <a
                  href="#how-it-works"
                  className="focus-ring rounded-sm border border-border px-5 py-2.5 font-mono text-[13px] text-text transition-colors hover:border-accent/60"
                >
                  how it works
                </a>
              </div>
            </div>

            {/* Hero illustration: a photo becoming PDF pages, one looping moment */}
            <div className="relative hidden h-56 items-center justify-center sm:flex">
              <div className="hero-photo absolute h-36 w-28 rounded-sm border border-border bg-surface shadow-sm" style={{ boxShadow: "0 12px 30px -12px rgb(var(--color-text) / 0.25)" }}>
                <div className="absolute inset-3 rounded-[2px] bg-gradient-to-br from-accent/30 to-accent/10" />
              </div>
              <div className="hero-page-1 absolute h-36 w-28 rounded-sm border border-border bg-surface" style={{ boxShadow: "0 12px 30px -12px rgb(var(--color-text) / 0.2)" }}>
                <div className="absolute left-3 right-3 top-4 h-1.5 rounded-full bg-border" />
                <div className="absolute left-3 right-6 top-7 h-1.5 rounded-full bg-border" />
                <div className="absolute left-3 right-8 top-10 h-1.5 rounded-full bg-border" />
              </div>
              <div className="hero-page-2 absolute h-36 w-28 rounded-sm border border-border bg-surface" style={{ boxShadow: "0 16px 34px -14px rgb(var(--color-text) / 0.25)" }}>
                <div className="absolute left-3 right-3 top-4 h-1.5 rounded-full bg-border" />
                <div className="absolute left-3 right-5 top-7 h-1.5 rounded-full bg-border" />
                <div className="absolute left-3 right-9 top-10 h-1.5 rounded-full bg-border" />
                <span className="absolute bottom-3 right-3 font-mono text-[9px] text-accent">.pdf</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2">
            {liveTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="focus-ring group rounded-sm border border-border bg-surface p-7 transition-colors hover:border-accent/60"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-accent">
                    {tool.icon}
                  </span>
                  <span className="font-mono text-[12px] text-muted/50">
                    {tool.tag}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-2xl text-text">
                  {tool.title}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">
                  {tool.desc}
                </p>
                <span className="mt-4 inline-block font-mono text-[11px] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  open →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-t border-border bg-surface/50">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-display text-2xl text-text">How it works</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n}>
                  <span className="font-display text-3xl text-accent">
                    {step.n}
                  </span>
                  <h3 className="mt-3 text-[15px] font-medium text-text">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl text-text">
                Coming in phase two
              </h2>
              <span className="font-mono text-[11px] text-muted/60">
                not yet available
              </span>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {upcoming.map((item) => (
                <div
                  key={item.tag}
                  className="rounded-sm border border-dashed border-border p-7 opacity-70"
                >
                  <span className="font-mono text-[12px] text-muted/50">
                    {item.tag}
                  </span>
                  <h3 className="mt-4 font-display text-xl text-text">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
