import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          FlowState
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/timeline" className="hover:text-foreground transition-colors">
            Timeline
          </Link>
          <Link href="/settings" className="hover:text-foreground transition-colors">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
