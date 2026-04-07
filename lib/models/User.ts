import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  clerkUserId: string
  email: string
  githubAccessToken: string
  githubConnected: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkUserId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    githubAccessToken: { type: String, default: '' },
    githubConnected: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)

export default User
