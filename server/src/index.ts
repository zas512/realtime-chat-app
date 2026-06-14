import express from 'express'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import apiRoutes from './routes'
import { initSocket } from './socket'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', apiRoutes)

const server = http.createServer(app)
const io = new IOServer(server, { cors: { origin: '*' } })

initSocket(io)

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app').then(() => {
  server.listen(PORT, () => console.log(`Server listening on ${PORT}`))
}).catch((err) => console.error('Mongo error', err))
