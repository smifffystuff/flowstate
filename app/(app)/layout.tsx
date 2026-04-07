import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex flex-1">
      <aside className="w-56 border-r border-border bg-background px-4 py-6 flex flex-col gap-1">
        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/timeline"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Timeline
          </Link>
          <Link
            href="/settings"
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Settings
          </Link>
        </nav>
      </aside>
      <div className="flex-1 px-8 py-6">{children}</div>
    </div>
  );
}
