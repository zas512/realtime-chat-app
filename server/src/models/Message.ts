import mongoose, { Schema } from 'mongoose'

const MessageSchema = new Schema({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  media: [String],
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  reactions: [{ userId: Schema.Types.ObjectId, type: String }],
  deleted: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Message', MessageSchema)
