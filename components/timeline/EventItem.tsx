'use client'

import { Badge } from '@/components/ui/badge'
import { GitCommitHorizontal, GitPullRequest, RefreshCw, Eye } from 'lucide-react'

export interface EventData {
  id: string
  timestamp: string
  type: 'commit' | 'pr_open' | 'pr_update' | 'pr_review'
  repo: string
  metadata: {
    message?: string
    prNumber?: number
    prTitle?: string
    url?: string
  }
}

const TYPE_ICON = {
  commit: GitCommitHorizontal,
  pr_open: GitPullRequest,
  pr_update: RefreshCw,
  pr_review: Eye,
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function absoluteTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function EventItem({ event }: { event: EventData }) {
  const date = new Date(event.timestamp)
  const Icon = TYPE_ICON[event.type]
  const label =
    event.metadata.message
      ? event.metadata.message.slice(0, 80)
      : event.metadata.prTitle
        ? event.metadata.prTitle.slice(0, 80)
        : '(no message)'

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 text-muted-foreground shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{label}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Badge variant="secondary" className="text-xs font-normal px-1.5 py-0">
            {event.repo}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {relativeTime(date)} · {absoluteTime(date)}
          </span>
        </div>
      </div>
    </div>
  )
}
