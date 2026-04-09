import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getOrCreateUser, setGithubToken } from '@/lib/users'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('github_oauth_state')?.value
  cookieStore.delete('github_oauth_state')

  if (!state || !savedState || state !== savedState) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  const redirectUri = process.env.GITHUB_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 })
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  })

  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 502 })
  }

  const tokenData = await tokenRes.json()
  const accessToken: string = tokenData.access_token
  if (!accessToken) {
    return NextResponse.json({ error: 'No access token in response' }, { status: 502 })
  }

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''

  await getOrCreateUser(userId, email)
  await setGithubToken(userId, accessToken)

  redirect('/dashboard?connected=1')
}
