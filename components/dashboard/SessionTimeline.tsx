'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SessionBlock {
  id: string
  start: string
  end: string
  durationMinutes: number
  repos: string[]
}

interface TooltipState {
  session: SessionBlock
  x: number
  y: number
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

const HOUR_LABELS = ['12a', '6a', '12p', '6p', '12a']
const HOUR_POSITIONS = [0, 25, 50, 75, 100]

export function SessionTimeline() {
  const [sessions, setSessions] = useState<SessionBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    const today = new Date()
    const from = new Date(today)
    from.setHours(0, 0, 0, 0)
    const to = new Date(today)
    to.setHours(23, 59, 59, 999)

    fetch(`/api/sessions?from=${from.toISOString()}&to=${to.toISOString()}`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Today&apos;s Flow Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {loading ? (
          <Skeleton className="h-12 w-full rounded-md" />
        ) : sessions.length === 0 ? (
          <div className="flex h-12 items-center justify-center">
            <p className="text-xs text-muted-foreground">No flow sessions recorded today</p>
          </div>
        ) : (
          <div className="relative">
            {/* Session blocks */}
            <div className="relative h-10 rounded-md bg-muted overflow-hidden">
              {sessions.map((s) => {
                const start = new Date(s.start)
                const startMins = start.getHours() * 60 + start.getMinutes()
                const leftPct = (startMins / 1440) * 100
                const widthPct = Math.max((s.durationMinutes / 1440) * 100, 0.5)
                return (
                  <div
                    key={s.id}
                    className="absolute top-0 h-full bg-primary opacity-80 hover:opacity-100 cursor-pointer transition-opacity rounded-sm"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                      setTooltip({
                        session: s,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
              {/* Tooltip */}
              {tooltip && (
                <div
                  className="pointer-events-none absolute z-10 rounded-md border bg-background px-3 py-2 text-xs shadow-md"
                  style={{
                    left: Math.min(tooltip.x + 8, 200),
                    top: tooltip.y - 80,
                    minWidth: 160,
                  }}
                >
                  <p className="font-medium">
                    {formatTime(tooltip.session.start)} – {formatTime(tooltip.session.end)}
                  </p>
                  <p className="text-muted-foreground">
                    {formatDuration(tooltip.session.durationMinutes)}
                  </p>
                  {tooltip.session.repos.length > 0 && (
                    <p className="text-muted-foreground truncate">
                      {tooltip.session.repos.slice(0, 2).join(', ')}
                      {tooltip.session.repos.length > 2 &&
                        ` +${tooltip.session.repos.length - 2} more`}
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* Hour axis */}
            <div className="relative mt-1 flex justify-between text-xs text-muted-foreground">
              {HOUR_LABELS.map((label, i) => (
                <span
                  key={label + i}
                  className="absolute"
                  style={{ left: `${HOUR_POSITIONS[i]}%`, transform: 'translateX(-50%)' }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
