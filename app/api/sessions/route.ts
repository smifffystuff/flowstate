import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Session from '@/lib/models/Session'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl

  const now = new Date()
  const defaultFrom = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  let from: Date
  let to: Date

  const fromParam = searchParams.get('from')
  if (fromParam) {
    from = new Date(fromParam)
    if (isNaN(from.getTime())) {
      return NextResponse.json({ error: 'Invalid "from" date' }, { status: 400 })
    }
  } else {
    from = defaultFrom
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
  })
    .sort({ start: -1 })
    .lean()

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: String(s._id),
      start: s.start,
      end: s.end,
      durationMinutes: s.durationMinutes,
      eventCount: s.eventIds.length,
      repos: s.repos,
      repoCount: s.repoCount,
      contextSwitches: s.contextSwitches,
    })),
  })
}
