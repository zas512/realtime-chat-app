import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000') {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = io(url, { autoConnect: true })
    return () => { socketRef.current?.disconnect() }
  }, [url])

  return socketRef
}
