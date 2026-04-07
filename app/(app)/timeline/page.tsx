import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import Event from '@/lib/models/Event'
import User from '@/lib/models/User'
import { Timeline } from '@/components/timeline/Timeline'

export default async function TimelinePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [user, events, repos] = await Promise.all([
    User.findOne({ clerkUserId: userId }).lean(),
    Event.find({ userId, timestamp: { $gte: sevenDaysAgo } })
      .sort({ timestamp: -1 })
      .limit(200)
      .lean(),
    Event.distinct('repo', { userId }),
  ])

  const githubConnected = user?.githubConnected ?? false

  const initialEvents = events.map((e) => ({
    id: String(e._id),
    timestamp: (e.timestamp as Date).toISOString(),
    type: e.type as 'commit' | 'pr_open' | 'pr_update' | 'pr_review',
    repo: e.repo,
    metadata: e.metadata ?? {},
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
      <Timeline
        initialEvents={initialEvents}
        repos={(repos as string[]).sort()}
        githubConnected={githubConnected}
      />
    </div>
  )
}
