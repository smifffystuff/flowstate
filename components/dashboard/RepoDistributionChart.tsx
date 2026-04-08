'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RepoData {
  repo: string
  eventCount: number
}

function shortRepoName(repo: string): string {
  const parts = repo.split('/')
  return parts[parts.length - 1] ?? repo
}

export function RepoDistributionChart({ repos }: { repos: RepoData[] }) {
  if (repos.length === 0) return null

  const total = repos.reduce((sum, r) => sum + r.eventCount, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Repo Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {repos.map((r) => {
            const pct = total > 0 ? Math.round((r.eventCount / total) * 100) : 0
            return (
              <div key={r.repo}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span
                    className="max-w-[60%] truncate font-mono text-xs"
                    title={r.repo}
                  >
                    {shortRepoName(r.repo)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.eventCount} events · {pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
