'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SyncButton } from '@/components/SyncButton'
import { Menu, X, LayoutDashboard, Clock, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  lastSyncAt: string | null
  githubConnected: boolean
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </>
  )
}

export function AppSidebar({ lastSyncAt, githubConnected }: AppSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-30 border-b border-border bg-background px-4 h-12 flex items-center justify-between">
        <span className="text-sm font-medium">
          {navItems.find((n) => pathname.startsWith(n.href))?.label ?? 'FlowState'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed left-0 right-0 bottom-0 z-20 bg-background border-r border-border px-4 py-4 flex flex-col gap-4" style={{ top: '6.5rem' }}>
          <nav className="flex flex-col gap-1 text-sm">
            <NavLinks pathname={pathname} onClick={() => setMobileOpen(false)} />
          </nav>
          {githubConnected && (
            <div className="mt-auto">
              <SyncButton lastSyncAt={lastSyncAt} />
            </div>
          )}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-border bg-background px-4 py-6 flex-col gap-4">
        <nav className="flex flex-col gap-1 text-sm">
          <NavLinks pathname={pathname} />
        </nav>
        {githubConnected && (
          <div className="mt-auto">
            <SyncButton lastSyncAt={lastSyncAt} />
          </div>
        )}
      </aside>
    </>
  )
}
