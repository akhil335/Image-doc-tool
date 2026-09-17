import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-baseline gap-2 focus-ring rounded-sm">
          <div className="flex gap-3 items-center font-display text-xl tracking-tight text-text">
            <Image src="/logo.svg" alt="logo" width={50} height={50} />
            DocForge
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 font-mono text-[13px] text-muted sm:flex">
            <Link href="/tools/image-to-pdf" className="hover:text-text focus-ring rounded-sm">
              image → pdf
            </Link>
            <Link href="/tools/pdf-to-image" className="hover:text-text focus-ring rounded-sm">
              pdf → image
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
