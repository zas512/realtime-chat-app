import { io, Socket } from 'socket.io-client'

export function createSocket() {
  return io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  }) as Socket
}
