import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            FlowState – Understand your deep work
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect GitHub and instantly see when you were in flow — no manual
            input required.
          </p>
        </div>
        <div className="flex justify-center">
          <Link href="/sign-in" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started
          </Link>
        </div>
        <Card className="text-left">
          <CardContent className="pt-6 grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="font-semibold mb-1">Automatic detection</p>
              <p className="text-muted-foreground">
                Flow sessions are detected from your GitHub activity — commits,
                PRs, and reviews.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Instant insights</p>
              <p className="text-muted-foreground">
                See your most productive times, longest streaks, and focus
                patterns at a glance.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Zero friction</p>
              <p className="text-muted-foreground">
                No timers, no tags, no manual logging. Just connect and go.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
