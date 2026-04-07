'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EVENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'commit', label: 'Commit' },
  { value: 'pr_open', label: 'PR Open' },
  { value: 'pr_update', label: 'PR Update' },
  { value: 'pr_review', label: 'PR Review' },
]

export interface FilterState {
  from: string
  to: string
  repo: string
  type: string
}

interface FilterBarProps {
  filters: FilterState
  repos: string[]
  onChange: (filters: FilterState) => void
}

export function FilterBar({ filters, repos, onChange }: FilterBarProps) {
  function update(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">From</label>
        <Input
          type="date"
          value={filters.from}
          onChange={(e) => update('from', e.target.value)}
          className="w-36"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">To</label>
        <Input
          type="date"
          value={filters.to}
          onChange={(e) => update('to', e.target.value)}
          className="w-36"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Repository</label>
        <Select value={filters.repo} onValueChange={(v) => v && update('repo', v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Repos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Repos</SelectItem>
            {repos.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Type</label>
        <Select value={filters.type} onValueChange={(v) => v && update('type', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
