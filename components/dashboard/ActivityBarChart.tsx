'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DayData {
  date: string
  minutes: number
}

function formatMinutes(minutes: number): string {
  const total = Math.round(minutes)
  if (total === 0) return '0 min'
  if (total < 60) return `${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{formatMinutes(payload[0].value)}</p>
    </div>
  )
}

export function ActivityBarChart({ data }: { data: DayData[] }) {
  const chartData = data.map((d) => ({ ...d, label: dayLabel(d.date) }))

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Daily Coding Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                if (v === 0) return ''
                if (v < 60) return `${Math.round(v)}m`
                return `${Math.floor(v / 60)}h`
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
