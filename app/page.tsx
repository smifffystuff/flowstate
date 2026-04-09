import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { GitBranch, Zap, BarChart2 } from 'lucide-react'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Understand your deep work
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto">
              FlowState connects to GitHub and automatically detects when you were
              in flow — no manual input required.
            </p>
          </div>
          <Link href="/sign-in" className={cn(buttonVariants({ size: 'lg' }))}>
            Get Started
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-muted/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <GitBranch className="w-6 h-6 mb-2 text-primary" />
                <CardTitle className="text-base">GitHub powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connects to your GitHub account and ingests commits and pull
                  requests automatically.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Zap className="w-6 h-6 mb-2 text-primary" />
                <CardTitle className="text-base">Automatic flow detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A gap heuristic algorithm identifies uninterrupted coding
                  sessions without any manual tagging.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <BarChart2 className="w-6 h-6 mb-2 text-primary" />
                <CardTitle className="text-base">No manual tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No timers, no tags, no logging. Connect once and your
                  productivity history appears instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-border text-center text-xs text-muted-foreground">
        <p>
          Built with Next.js &amp; Vercel &nbsp;·&nbsp;{' '}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
