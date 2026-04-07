import { connectDB } from './db'
import User, { IUser } from './models/User'
import { encrypt } from './crypto'

export async function getOrCreateUser(clerkUserId: string, email: string): Promise<IUser> {
  await connectDB()
  const existing = await User.findOne({ clerkUserId })
  if (existing) return existing
  return User.create({ clerkUserId, email })
}

export async function setGithubToken(clerkUserId: string, token: string): Promise<void> {
  await connectDB()
  const encryptedToken = encrypt(token)
  await User.findOneAndUpdate(
    { clerkUserId },
    { githubAccessToken: encryptedToken, githubConnected: true },
    { upsert: true }
  )
}
