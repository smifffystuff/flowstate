import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ISession extends Document {
  userId: string
  start: Date
  end: Date
  durationMinutes: number
  eventIds: Types.ObjectId[]
  repos: string[]
  repoCount: number
  contextSwitches: number
}

const SessionSchema = new Schema<ISession>({
  userId: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  eventIds: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  repos: [{ type: String }],
  repoCount: { type: Number, required: true },
  contextSwitches: { type: Number, required: true },
})

SessionSchema.index({ userId: 1, start: 1 })

const Session: Model<ISession> =
  mongoose.models.Session ?? mongoose.model<ISession>('Session', SessionSchema)

export default Session
