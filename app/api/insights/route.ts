import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Session from '@/lib/models/Session'
import Event from '@/lib/models/Event'

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Monday = 0 offset, Sunday = 6 offset
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const now = new Date()

  let from: Date
  let to: Date

  const fromParam = searchParams.get('from')
  if (fromParam) {
    from = new Date(fromParam)
    if (isNaN(from.getTime())) {
      return NextResponse.json({ error: 'Invalid "from" date' }, { status: 400 })
    }
  } else {
    from = startOfWeek(now)
  }

  const toParam = searchParams.get('to')
  if (toParam) {
    to = new Date(toParam)
    if (isNaN(to.getTime())) {
      return NextResponse.json({ error: 'Invalid "to" date' }, { status: 400 })
    }
  } else {
    to = now
  }

  await connectDB()

  const sessions = await Session.find({
    userId,
    start: { $gte: from, $lte: to },
  }).lean()

  const flowSessionCount = sessions.length
  const totalCodingMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const avgFlowDurationMinutes =
    flowSessionCount > 0 ? Math.round(totalCodingMinutes / flowSessionCount) : 0
  const longestFlowMinutes =
    flowSessionCount > 0 ? Math.max(...sessions.map((s) => s.durationMinutes)) : 0
  const contextSwitchesTotal = sessions.reduce((sum, s) => sum + s.contextSwitches, 0)

  // Active days: distinct calendar dates with at least one session start
  const activeDaySet = new Set<string>()
  for (const s of sessions) {
    activeDaySet.add(s.start.toISOString().slice(0, 10))
  }
  const activeDays = activeDaySet.size

  // Days in window (for avg context switches per day)
  const windowDays = Math.max(
    1,
    Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  )
  const avgContextSwitchesPerDay = parseFloat(
    (contextSwitchesTotal / windowDays).toFixed(1)
  )

  // Top repos by event count
  const topReposAgg = await Event.aggregate([
    { $match: { userId, timestamp: { $gte: from, $lte: to } } },
    { $group: { _id: '$repo', eventCount: { $sum: 1 } } },
    { $sort: { eventCount: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, repo: '$_id', eventCount: 1 } },
  ])

  return NextResponse.json({
    totalCodingMinutes,
    flowSessionCount,
    avgFlowDurationMinutes,
    longestFlowMinutes,
    contextSwitchesTotal,
    avgContextSwitchesPerDay,
    activeDays,
    topRepos: topReposAgg,
  })
}
