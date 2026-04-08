import { type RawCommit, type RawPR } from './github'

// Matches the IEvent shape without the Mongoose Document fields
export interface EventDocument {
  userId: string
  timestamp: Date
  type: 'commit' | 'pr_open' | 'pr_update' | 'pr_review'
  repo: string
  githubId: string
  metadata: {
    message?: string
    prNumber?: number
    prTitle?: string
    url?: string
  }
}

export function normaliseCommit(
  raw: RawCommit,
  userId: string,
  repo: string
): EventDocument {
  const firstLine = raw.commit.message.split('\n')[0]
  return {
    userId,
    timestamp: new Date(raw.commit.author.date),
    type: 'commit',
    repo,
    githubId: raw.sha,
    metadata: {
      message: firstLine,
    },
  }
}

export function normalisePR(
  raw: RawPR,
  userId: string,
  repo: string,
  since: Date
): EventDocument {
  const createdAt = new Date(raw.created_at)
  const isNew = createdAt >= since
  const type = isNew ? 'pr_open' : 'pr_update'
  const timestamp = isNew ? createdAt : new Date(raw.updated_at)

  return {
    userId,
    timestamp,
    type,
    repo,
    githubId: `${raw.node_id}:${type}`,
    metadata: {
      prNumber: raw.number,
      prTitle: raw.title,
      url: raw.html_url,
    },
  }
}
