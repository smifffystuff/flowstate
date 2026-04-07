import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Event from '@/lib/models/Event'
import Session from '@/lib/models/Session'
import { detectSessions } from '@/lib/sessions'

export async function POST(request: NextRequest) {
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

  const events = await Event.find({
    userId,
    timestamp: { $gte: from, $lte: to },
  }).sort({ timestamp: 1 })

  const sessions = detectSessions(events)

  // Idempotent: delete existing sessions for the window, then insert freshly computed ones
  await Session.deleteMany({ userId, start: { $gte: from, $lte: to } })

  if (sessions.length > 0) {
    await Session.insertMany(sessions)
  }

  return NextResponse.json({ sessions: sessions.length, events: events.length })
}
