'use client'

import { useState, useEffect, useCallback } from 'react'
import { MetricCard } from './MetricCard'
import { ActivityBarChart } from './ActivityBarChart'
import { SessionTimeline } from './SessionTimeline'
import { RepoDistributionChart } from './RepoDistributionChart'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InsightsData {
  totalCodingMinutes: number
  flowSessionCount: number
  avgFlowDurationMinutes: number
  longestFlowMinutes: number
  contextSwitchesTotal: number
  avgContextSwitchesPerDay: number
  activeDays: number
  topRepos: { repo: string; eventCount: number }[]
  dailyMinutes: { date: string; minutes: number }[]
}

type Range = 'this-week' | 'last-7' | 'last-14'

function formatMinutes(minutes: number): string {
  const total = Math.round(minutes)
  if (total < 60) return `${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

function getRangeDates(range: Range): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()

  if (range === 'this-week') {
    const d = new Date(now)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    // Use UTC midnight of the local Monday date to avoid timezone shift on the server
    const from = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString()
    return { from, to }
  }

  const days = range === 'last-7' ? 7 : 14
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  return { from, to }
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function ActiveDaysRow({
  activeDays,
  range,
}: {
  activeDays: number
  range: Range
}) {
  const now = new Date()

  const days: { label: string; date: Date }[] = []

  if (range === 'this-week') {
    const monday = new Date(now)
    const day = monday.getDay()
    const diff = day === 0 ? -6 : 1 - day
    monday.setDate(monday.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      days.push({ label: DAY_LABELS[i], date: d })
    }
  } else {
    const monday = new Date(now)
    const day = monday.getDay()
    const diff = day === 0 ? -6 : 1 - day
    monday.setDate(monday.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      days.push({ label: DAY_LABELS[i], date: d })
    }
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  let remaining = activeDays
  const active = days.map((d) => {
    if (d.date <= today && remaining > 0) {
      remaining--
      return true
    }
    return false
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Active Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {days.map((d, i) => (
            <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs text-muted-foreground">{d.label}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  active[i]
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {d.date.getDate()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-52 w-full rounded-lg" />
        <Skeleton className="h-52 w-full rounded-lg" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  )
}

interface DashboardClientProps {
  initialData: InsightsData
  initialRange: Range
}

export function DashboardClient({ initialData, initialRange }: DashboardClientProps) {
  const [range, setRange] = useState<Range>(initialRange)
  const [data, setData] = useState<InsightsData>(initialData)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const fetchInsights = useCallback(async (r: Range) => {
    setLoading(true)
    try {
      const { from, to } = getRangeDates(r)
      const res = await fetch(`/api/insights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights(range)
  }, [range, fetchInsights])

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch('/api/github/sync', { method: 'POST' })
      await fetchInsights(range)
    } finally {
      setSyncing(false)
    }
  }

  const isEmpty = data.flowSessionCount === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="this-week">This Week</TabsTrigger>
            <TabsTrigger value="last-7">Last 7 Days</TabsTrigger>
            <TabsTrigger value="last-14">Last 14 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <MetricsSkeleton />
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <p className="text-muted-foreground">
            No activity yet. Sync your GitHub account to get started.
          </p>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync Now'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Coding Time"
              value={formatMinutes(data.totalCodingMinutes)}
              subtext="this period"
            />
            <MetricCard
              label="Flow Sessions"
              value={String(data.flowSessionCount)}
              subtext="this period"
            />
            <MetricCard
              label="Avg Flow Duration"
              value={formatMinutes(data.avgFlowDurationMinutes)}
            />
            <MetricCard
              label="Context Switches"
              value={String(data.contextSwitchesTotal)}
              subtext="this period"
            />
          </div>

          <ActiveDaysRow activeDays={data.activeDays} range={range} />

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.dailyMinutes.length > 0 && (
              <ActivityBarChart data={data.dailyMinutes} />
            )}
            <SessionTimeline />
          </div>

          {/* Repo distribution */}
          {data.topRepos.length > 0 && (
            <RepoDistributionChart repos={data.topRepos} />
          )}
        </div>
      )}
    </div>
  )
}
