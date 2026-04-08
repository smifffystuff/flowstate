import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IEvent extends Document {
  userId: string
  timestamp: Date
  type: 'commit' | 'pr_open' | 'pr_update' | 'pr_review'
  repo: string
  metadata: {
    message?: string
    prNumber?: number
    prTitle?: string
    url?: string
  }
  githubId: string
}

const EventSchema = new Schema<IEvent>({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  type: {
    type: String,
    required: true,
    enum: ['commit', 'pr_open', 'pr_update', 'pr_review'],
  },
  repo: { type: String, required: true },
  metadata: {
    message: String,
    prNumber: Number,
    prTitle: String,
    url: String,
  },
  githubId: { type: String, required: true },
})

EventSchema.index({ userId: 1, timestamp: 1 })
EventSchema.index({ userId: 1, githubId: 1 }, { unique: true })

const Event: Model<IEvent> =
  mongoose.models.Event ?? mongoose.model<IEvent>('Event', EventSchema)

export default Event
