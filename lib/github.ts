export interface Repo {
  owner: string
  name: string
  fullName: string
  updatedAt: string
}

export interface RawCommit {
  sha: string
  commit: {
    author: {
      name: string
      date: string
    }
    message: string
  }
}

export interface RawPR {
  node_id: string
  number: number
  title: string
  html_url: string
  created_at: string
  updated_at: string
  user: {
    login: string
  }
}

function checkRateLimit(headers: Headers): void {
  const remaining = headers.get('x-ratelimit-remaining')
  if (remaining === '0') {
    const reset = headers.get('x-ratelimit-reset')
    const resetAt = reset ? new Date(parseInt(reset) * 1000).toISOString() : 'unknown'
    throw new Error(`GitHub rate limit exceeded. Resets at ${resetAt}`)
  }
}

async function githubFetch<T>(token: string, path: string): Promise<T> {
  const url = `https://api.github.com${path}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (res.status === 401) {
    throw Object.assign(new Error('GitHub token is invalid or expired'), { status: 401 })
  }
  if (res.status === 403) {
    checkRateLimit(res.headers)
    throw Object.assign(new Error('GitHub API forbidden'), { status: 403 })
  }
  if (!res.ok) {
    throw Object.assign(new Error(`GitHub API error: ${res.status}`), { status: res.status })
  }

  checkRateLimit(res.headers)
  return res.json() as Promise<T>
}

export async function getUserRepos(token: string): Promise<Repo[]> {
  const raw = await githubFetch<Array<{
    owner: { login: string }
    name: string
    full_name: string
    updated_at: string
  }>>(token, '/user/repos?affiliation=owner,collaborator&sort=updated&per_page=50')

  return raw.map((r) => ({
    owner: r.owner.login,
    name: r.name,
    fullName: r.full_name,
    updatedAt: r.updated_at,
  }))
}

export async function getCommits(
  token: string,
  owner: string,
  repo: string,
  since: Date
): Promise<RawCommit[]> {
  const sinceISO = since.toISOString()
  const path = `/repos/${owner}/${repo}/commits?author=@me&since=${sinceISO}&per_page=100`
  try {
    return await githubFetch<RawCommit[]>(token, path)
  } catch (err: unknown) {
    // 409 means empty repo, 404 means no access — skip silently
    const status = (err as { status?: number }).status
    if (status === 404 || status === 409) return []
    throw err
  }
}

export async function getPullRequests(
  token: string,
  owner: string,
  repo: string,
  since: Date
): Promise<RawPR[]> {
  const sinceISO = since.toISOString()
  const path = `/repos/${owner}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=50`
  try {
    const prs = await githubFetch<RawPR[]>(token, path)
    return prs.filter((pr) => new Date(pr.updated_at) >= since)
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 404 || status === 409) return []
    throw err
  }
}
