'use client'

import Link from 'next/link'
import { SyncButton } from '@/components/SyncButton'

interface AppSidebarProps {
  lastSyncAt: string | null
  githubConnected: boolean
}

export function AppSidebar({ lastSyncAt, githubConnected }: AppSidebarProps) {
  return (
    <aside className="w-56 border-r border-border bg-background px-4 py-6 flex flex-col gap-4">
      <nav className="flex flex-col gap-1 text-sm">
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/timeline"
          className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          Timeline
        </Link>
        <Link
          href="/settings"
          className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          Settings
        </Link>
      </nav>
      {githubConnected && (
        <div className="mt-auto">
          <SyncButton lastSyncAt={lastSyncAt} />
        </div>
      )}
    </aside>
  )
}
