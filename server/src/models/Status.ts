import mongoose, { Schema } from 'mongoose'

const StatusSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  content: String,
  media: [String],
  expiresAt: Date,
  seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export default mongoose.model('Status', StatusSchema)
