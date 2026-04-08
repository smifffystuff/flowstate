import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const user = await User.findOne({ clerkUserId: userId }).lean()
  if (!user) {
    return NextResponse.json({
      syncStatus: 'idle',
      lastSyncAt: null,
      githubConnected: false,
    })
  }

  return NextResponse.json({
    syncStatus: user.syncStatus ?? 'idle',
    lastSyncAt: user.lastSyncAt ?? null,
    githubConnected: user.githubConnected,
  })
}
