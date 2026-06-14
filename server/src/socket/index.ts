import { Server } from 'socket.io'
import { SocketEvents } from '../../../shared/constants/socketEvents'

export function initSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id)

    socket.on(SocketEvents.MESSAGE, (payload: any) => {
      io.to(payload.chatId).emit(SocketEvents.MESSAGE, payload)
    })

    socket.on(SocketEvents.JOIN, (chatId: string) => socket.join(chatId))
    socket.on(SocketEvents.LEAVE, (chatId: string) => socket.leave(chatId))
  })
}
