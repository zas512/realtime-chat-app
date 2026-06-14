import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String,
  lastSeen: Date,
  online: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('User', UserSchema)
