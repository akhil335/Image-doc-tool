import Link from "next/link";

interface ToolHeaderProps {
  tag: string;
  title: string;
  description: string;
  badge?: string;
}

export default function ToolHeader({
  tag,
  title,
  description,
  badge,
}: ToolHeaderProps) {
  return (
    <div className="mb-8 max-w-3xl mx-auto text-center space-y-3">
      {/* Studio Breadcrumb and Badge */}
      <div className="inline-flex items-center gap-2 font-mono text-[11px] text-muted">
        <Link
          href="/"
          className="hover:text-accent transition-colors focus-ring rounded flex items-center gap-1"
        >
          <span>←</span>
          <span>Studio</span>
        </Link>
        <span className="text-border">/</span>
        <span className="text-accent font-semibold">{tag}</span>
        {badge && (
          <span className="rounded-full bg-accent/10 border border-accent/25 px-2 py-0.5 text-[10px] text-accent font-semibold ml-1">
            {badge}
          </span>
        )}
      </div>

      <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-text">
        {title}
      </h1>

      <p className="text-[14px] sm:text-[15px] leading-relaxed text-muted max-w-xl mx-auto">
        {description}
      </p>
    </div>
  );
}
