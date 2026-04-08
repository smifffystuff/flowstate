import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const { userId } = await auth();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          FlowState
        </Link>
        <div className="flex items-center gap-3">
          {userId ? (
            <UserButton />
          ) : (
            <Link
              href="/sign-in"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
