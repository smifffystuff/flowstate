import { Types } from 'mongoose'
import { IEvent } from './models/Event'

export const SESSION_GAP_MINUTES = 10

export interface SessionData {
  userId: string
  start: Date
  end: Date
  durationMinutes: number
  eventIds: Types.ObjectId[]
  repos: string[]
  repoCount: number
  contextSwitches: number
}

export function detectSessions(events: IEvent[]): SessionData[] {
  if (events.length === 0) return []

  // Events must be sorted ascending by timestamp
  const sorted = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )

  const gapMs = SESSION_GAP_MINUTES * 60 * 1000
  const sessions: SessionData[] = []

  let sessionEvents: IEvent[] = []

  for (const event of sorted) {
    if (sessionEvents.length === 0) {
      sessionEvents.push(event)
      continue
    }

    const last = sessionEvents[sessionEvents.length - 1]
    const gap = event.timestamp.getTime() - last.timestamp.getTime()

    if (gap <= gapMs) {
      sessionEvents.push(event)
    } else {
      const session = buildSession(sessionEvents)
      if (session) sessions.push(session)
      sessionEvents = [event]
    }
  }

  // Close the final session
  const last = buildSession(sessionEvents)
  if (last) sessions.push(last)

  return sessions
}

function buildSession(events: IEvent[]): SessionData | null {
  if (events.length < 2) return null

  const start = events[0].timestamp
  const end = events[events.length - 1].timestamp
  const durationMinutes = (end.getTime() - start.getTime()) / (60 * 1000)

  if (durationMinutes < 1) return null

  const eventIds = events.map((e) => e._id as Types.ObjectId)

  // Compute context switches: count repo changes in sequence
  let contextSwitches = 0
  for (let i = 1; i < events.length; i++) {
    if (events[i].repo !== events[i - 1].repo) {
      contextSwitches++
    }
  }

  const repos = [...new Set(events.map((e) => e.repo))]

  return {
    userId: events[0].userId,
    start,
    end,
    durationMinutes,
    eventIds,
    repos,
    repoCount: repos.length,
    contextSwitches,
  }
}
