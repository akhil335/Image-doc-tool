interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  subtext?: string;
}

export default function ProgressBar({
  progress,
  label,
  subtext,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      {(label || subtext) && (
        <div className="mb-2 flex items-center justify-between font-mono text-[12px]">
          {label && <span className="text-text">{label}</span>}
          {subtext && <span className="text-muted">{subtext}</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
