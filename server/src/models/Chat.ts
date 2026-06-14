import mongoose, { Schema } from 'mongoose'

const ChatSchema = new Schema({
  isGroup: { type: Boolean, default: false },
  name: String,
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  avatar: String,
  pinned: { type: Boolean, default: false },
  archivedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export default mongoose.model('Chat', ChatSchema)
