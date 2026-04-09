import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ErrorBoundary } from '@/components/ErrorBoundary'

async function getGithubStatus(userId: string) {
  await connectDB()
  const user = await User.findOne({ clerkUserId: userId }).lean()
  return {
    connected: user?.githubConnected ?? false,
  }
}

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { connected } = await getGithubStatus(userId)

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <ErrorBoundary context="settings">
        <div className="border border-border rounded-lg p-5">
          <h2 className="text-base font-medium mb-1">GitHub Connection</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your GitHub account to start tracking flow sessions from your commits and pull requests.
          </p>

          {connected ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Connected
            </div>
          ) : (
            <Link href="/api/github/connect" className={buttonVariants()}>
              Connect GitHub
            </Link>
          )}
        </div>
      </ErrorBoundary>
    </div>
  )
}
