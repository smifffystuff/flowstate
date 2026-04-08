import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import Session from '@/lib/models/Session'
import Event from '@/lib/models/Event'
import User from '@/lib/models/User'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const now = new Date()
  const from = startOfWeek(now)

  await connectDB()

  const user = await User.findOne({ clerkUserId: userId }).lean()
  const githubConnected = user?.githubConnected ?? false
  const lastSyncAt = user?.lastSyncAt ? user.lastSyncAt.toISOString() : null
  // Signal the client to auto-trigger a sync on first visit
  const shouldAutoSync = githubConnected && lastSyncAt === null

  const sessions = await Session.find({
    userId,
    start: { $gte: from, $lte: now },
  }).lean()

  const flowSessionCount = sessions.length
  const totalCodingMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const avgFlowDurationMinutes =
    flowSessionCount > 0 ? Math.round(totalCodingMinutes / flowSessionCount) : 0
  const longestFlowMinutes =
    flowSessionCount > 0 ? Math.max(...sessions.map((s) => s.durationMinutes)) : 0
  const contextSwitchesTotal = sessions.reduce((sum, s) => sum + s.contextSwitches, 0)

  const activeDaySet = new Set<string>()
  for (const s of sessions) {
    activeDaySet.add(s.start.toISOString().slice(0, 10))
  }
  const activeDays = activeDaySet.size

  const windowDays = Math.max(
    1,
    Math.ceil((now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  )
  const avgContextSwitchesPerDay = parseFloat(
    (contextSwitchesTotal / windowDays).toFixed(1)
  )

  const topReposAgg = await Event.aggregate([
    { $match: { userId, timestamp: { $gte: from, $lte: now } } },
    { $group: { _id: '$repo', eventCount: { $sum: 1 } } },
    { $sort: { eventCount: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, repo: '$_id', eventCount: 1 } },
  ])

  // Daily minutes: sum session durations per calendar day (UTC)
  const minutesByDay = new Map<string, number>()
  for (const s of sessions) {
    const key = s.start.toISOString().slice(0, 10)
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + s.durationMinutes)
  }
  const dailyMinutes: { date: string; minutes: number }[] = []
  const cursor = new Date(from)
  cursor.setUTCHours(0, 0, 0, 0)
  const windowEnd = new Date(now)
  windowEnd.setUTCHours(0, 0, 0, 0)
  while (cursor <= windowEnd) {
    const key = cursor.toISOString().slice(0, 10)
    dailyMinutes.push({ date: key, minutes: Math.round(minutesByDay.get(key) ?? 0) })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  const initialData = {
    totalCodingMinutes,
    flowSessionCount,
    avgFlowDurationMinutes,
    longestFlowMinutes,
    contextSwitchesTotal,
    avgContextSwitchesPerDay,
    activeDays,
    topRepos: topReposAgg,
    dailyMinutes,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your coding activity at a glance.</p>
      </div>
      <DashboardClient
        initialData={initialData}
        initialRange="this-week"
        githubConnected={githubConnected}
        shouldAutoSync={shouldAutoSync}
      />
    </div>
  )
}
