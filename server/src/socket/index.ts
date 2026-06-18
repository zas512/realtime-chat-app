import { Server as IOServer } from "socket.io";
import http from "node:http";
import { verifyToken } from "../utils/jwt";
import { registerSocketHandlers } from "./handlers";

export const initSocket = (server: http.Server): IOServer => {
  const io = new IOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) {
        console.log(`Socket ${socket.id} rejected — no cookie`);
        return next(new Error("Not authenticated"));
      }
      const tokenMatch = /token=([^;]+)/.exec(cookie);
      if (!tokenMatch) {
        console.log(`Socket ${socket.id} rejected — no token in cookie`);
        return next(new Error("Not authenticated"));
      }
      const decoded = verifyToken(tokenMatch[1]);
      socket.data.user = decoded;
      console.log(`Socket ${socket.id} authenticated — user ${decoded.id}`);
      next();
    } catch (err) {
      console.log(
        `Socket ${socket.id} rejected — error during authentication:`,
        err
      );
      console.log(`Socket ${socket.id} rejected — invalid token`);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.data.user.id} connected — socket ${socket.id}`);
    registerSocketHandlers(io, socket);
  });

  return io;
};
