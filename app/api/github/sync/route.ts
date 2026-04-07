import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import Event from '@/lib/models/Event'
import { decrypt } from '@/lib/crypto'
import { getUserRepos, getCommits, getPullRequests } from '@/lib/github'
import { normaliseCommit, normalisePR, type EventDocument } from '@/lib/events'

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const user = await User.findOne({ clerkUserId: userId })
  if (!user || !user.githubConnected || !user.githubAccessToken) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 })
  }

  let token: string
  try {
    token = decrypt(user.githubAccessToken)
  } catch {
    return NextResponse.json({ error: 'Failed to decrypt GitHub token' }, { status: 500 })
  }

  const since = user.lastSyncAt ?? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  let repos: Awaited<ReturnType<typeof getUserRepos>>
  try {
    repos = await getUserRepos(token)
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 401) {
      await User.findOneAndUpdate({ clerkUserId: userId }, { githubConnected: false })
      return NextResponse.json({ error: 'GitHub token invalid. Please reconnect.' }, { status: 401 })
    }
    if (status === 403) {
      return NextResponse.json(
        { error: 'GitHub rate limit exceeded. Please retry later.' },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 502 })
  }

  const allEvents: EventDocument[] = []
  let reposProcessed = 0

  for (const repo of repos) {
    try {
      const [commits, prs] = await Promise.all([
        getCommits(token, repo.owner, repo.name, since),
        getPullRequests(token, repo.owner, repo.name, since),
      ])

      for (const commit of commits) {
        allEvents.push(normaliseCommit(commit, userId, repo.fullName))
      }
      for (const pr of prs) {
        allEvents.push(normalisePR(pr, userId, repo.fullName, since))
      }

      reposProcessed++
    } catch (err: unknown) {
      const status = (err as { status?: number }).status
      if (status === 401) {
        await User.findOneAndUpdate({ clerkUserId: userId }, { githubConnected: false })
        return NextResponse.json(
          { error: 'GitHub token invalid. Please reconnect.' },
          { status: 401 }
        )
      }
      if (status === 403) {
        return NextResponse.json(
          { error: 'GitHub rate limit exceeded. Please retry later.' },
          { status: 429 }
        )
      }
      // Log per-repo failures but continue
      console.error(`[sync] Failed to sync repo ${repo.fullName}:`, err)
    }
  }

  let inserted = 0
  let skipped = 0

  if (allEvents.length > 0) {
    const result = await Event.insertMany(allEvents, { ordered: false }).catch(
      (err: { writeErrors?: Array<{ err?: { code?: number } }>; insertedDocs?: unknown[] }) => {
        // insertMany with ordered:false throws a BulkWriteError but still inserts non-duplicates
        if (err.writeErrors) {
          const duplicates = err.writeErrors.filter(
            (e) => e.err?.code === 11000
          ).length
          skipped = duplicates
          inserted = allEvents.length - duplicates - (err.writeErrors.length - duplicates)
          return null
        }
        throw err
      }
    )

    if (result) {
      inserted = Array.isArray(result) ? result.length : (result as { length?: number }).length ?? 0
    }
  }

  await User.findOneAndUpdate({ clerkUserId: userId }, { lastSyncAt: new Date() })

  return NextResponse.json({ inserted, skipped, repos: reposProcessed })
}
