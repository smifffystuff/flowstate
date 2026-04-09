'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

type SyncState = 'idle' | 'syncing' | 'success' | 'error'

interface SyncButtonProps {
  lastSyncAt?: string | null
  onSyncComplete?: () => void
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 min ago'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hr ago'
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? '1 day ago' : `${days} days ago`
}

export function SyncButton({ lastSyncAt: initialLastSyncAt, onSyncComplete }: SyncButtonProps) {
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(initialLastSyncAt ?? null)
  const [, setTick] = useState(0)

  // Re-render every minute to keep relative time fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  async function handleSync() {
    if (syncState === 'syncing') return
    setSyncState('syncing')
    try {
      const res = await fetch('/api/github/sync', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setSyncState('error')
        toast.error(`Sync failed: ${body.error ?? res.statusText}`)
        return
      }
      const now = new Date().toISOString()
      setLastSyncAt(now)
      setSyncState('success')
      toast.success('GitHub synced successfully')
      onSyncComplete?.()
      setTimeout(() => setSyncState('idle'), 3000)
    } catch {
      setSyncState('error')
      toast.error('Sync failed. Please try again.')
    }
  }

  const icon = {
    idle: <RefreshCw className="w-4 h-4" />,
    syncing: <Loader2 className="w-4 h-4 animate-spin" />,
    success: <CheckCircle2 className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
  }[syncState]

  const label = {
    idle: 'Sync Now',
    syncing: 'Syncing…',
    success: 'Synced',
    error: 'Retry Sync',
  }[syncState]

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={syncState === 'syncing'}
        className="gap-2"
      >
        {icon}
        {label}
      </Button>
      {lastSyncAt && (
        <p className="text-xs text-muted-foreground text-center">
          {formatRelativeTime(lastSyncAt)}
        </p>
      )}
    </div>
  )
}
