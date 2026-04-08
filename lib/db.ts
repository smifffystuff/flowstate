import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set')
}

const MONGODB_URI = process.env.MONGODB_URI

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConnection: Promise<typeof mongoose> | undefined
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConnection) {
    return global._mongooseConnection
  }

  global._mongooseConnection = mongoose.connect(MONGODB_URI)
  return global._mongooseConnection
}
