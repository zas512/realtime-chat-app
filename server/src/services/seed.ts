import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'
import Chat from '../models/Chat'
import Message from '../models/Message'

dotenv.config()

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app')
  await User.deleteMany({})
  await Chat.deleteMany({})
  await Message.deleteMany({})

  const alice = await User.create({ name: 'Alice', email: 'alice@example.com', password: 'pass' })
  const bob = await User.create({ name: 'Bob', email: 'bob@example.com', password: 'pass' })

  const chat = await Chat.create({ isGroup: false, members: [alice._id, bob._id] })
  await Message.create({ chatId: chat._id, senderId: alice._id, content: 'Hello Bob!' })

  console.log('Seeded demo data')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
