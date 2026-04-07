'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { EventItem, type EventData } from './EventItem'
import { FilterBar, type FilterState } from './FilterBar'

function toLocalDateString(date: Date): string {
  // Returns YYYY-MM-DD in the user's local timezone
  return new Intl.DateTimeFormat('en-CA').format(date)
}

function defaultFrom(): string {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return toLocalDateString(d)
}

function defaultTo(): string {
  return toLocalDateString(new Date())
}

function formatDayLabel(dateStr: string): string {
  // dateStr is YYYY-MM-DD; parse at local midnight to avoid timezone shift
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (toLocalDateString(date) === toLocalDateString(today)) return 'Today'
  if (toLocalDateString(date) === toLocalDateString(yesterday)) return 'Yesterday'

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

interface TimelineProps {
  initialEvents: EventData[]
  repos: string[]
  githubConnected: boolean
}

export function Timeline({ initialEvents, repos, githubConnected }: TimelineProps) {
  const [filters, setFilters] = useState<FilterState>({
    from: defaultFrom(),
    to: defaultTo(),
    repo: 'all',
    type: 'all',
  })
  const [allEvents, setAllEvents] = useState<EventData[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [fetchedRange, setFetchedRange] = useState({ from: defaultFrom(), to: defaultTo() })

  const fetchEvents = useCallback(async (from: string, to: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ from, to, limit: '200' })
      const res = await fetch(`/api/events?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAllEvents(data.events)
        setFetchedRange({ from, to })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  function handleFilterChange(next: FilterState) {
    setFilters(next)
    if (next.from !== fetchedRange.from || next.to !== fetchedRange.to) {
      fetchEvents(next.from, next.to)
    }
  }

  // Client-side filtering for repo and type
  const displayed = allEvents.filter((e) => {
    if (filters.repo !== 'all' && e.repo !== filters.repo) return false
    if (filters.type !== 'all' && e.type !== filters.type) return false
    return true
  })

  // Group by local calendar day, sorted most recent first
  const grouped = displayed.reduce<Record<string, EventData[]>>((acc, e) => {
    const day = toLocalDateString(new Date(e.timestamp))
    if (!acc[day]) acc[day] = []
    acc[day].push(e)
    return acc
  }, {})

  const days = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  if (!githubConnected) {
    return (
      <div className="text-center py-16 text-muted-foreground space-y-1">
        <p>Connect your GitHub account to see your activity.</p>
        <Link href="/settings" className="text-foreground underline inline-block">
          Go to Settings
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FilterBar filters={filters} repos={repos} onChange={handleFilterChange} />

      {loading ? (
        <div className="space-y-8">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              {[0, 1, 2].map((j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      ) : days.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No activity found — try syncing your GitHub account
        </div>
      ) : (
        <div className="space-y-8">
          {days.map((day) => (
            <div key={day}>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                {formatDayLabel(day)}
              </h2>
              <div className="divide-y divide-border rounded-md border border-border">
                {grouped[day].map((event) => (
                  <div key={event.id} className="px-3">
                    <EventItem event={event} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
