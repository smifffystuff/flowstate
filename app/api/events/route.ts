import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Event from '@/lib/models/Event'

const VALID_TYPES = ['commit', 'pr_open', 'pr_update', 'pr_review'] as const
const DEFAULT_LIMIT = 200
const MAX_LIMIT = 500
const DEFAULT_RANGE_DAYS = 14

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl

  const defaultFrom = new Date(Date.now() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000)
  const defaultTo = new Date()

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
    to = defaultTo
  }

  const typeParam = searchParams.get('type')
  if (typeParam && !VALID_TYPES.includes(typeParam as (typeof VALID_TYPES)[number])) {
    return NextResponse.json(
      { error: `Invalid "type". Must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  const limitParam = searchParams.get('limit')
  const limit = limitParam
    ? Math.min(Math.max(1, parseInt(limitParam, 10) || DEFAULT_LIMIT), MAX_LIMIT)
    : DEFAULT_LIMIT

  const offsetParam = searchParams.get('offset')
  const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10) || 0) : 0

  await connectDB()

  const query: Record<string, unknown> = {
    userId,
    timestamp: { $gte: from, $lte: to },
  }

  const repoParam = searchParams.get('repo')
  if (repoParam) {
    query.repo = repoParam
  }

  if (typeParam) {
    query.type = typeParam
  }

  const [events, total] = await Promise.all([
    Event.find(query).sort({ timestamp: -1 }).skip(offset).limit(limit).lean(),
    Event.countDocuments(query),
  ])

  return NextResponse.json({
    events: events.map((e) => ({
      id: String(e._id),
      timestamp: e.timestamp,
      type: e.type,
      repo: e.repo,
      metadata: e.metadata,
    })),
    total,
    hasMore: offset + events.length < total,
  })
}
