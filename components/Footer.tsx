export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[12px] text-muted">
          Files are converted locally in your browser. Nothing is uploaded to a server.
        </p>
        <p className="font-mono text-[12px] text-muted/70">
          DocForge · phase 01
        </p>
      </div>
    </footer>
  );
}
