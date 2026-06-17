import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "node:http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import apiRoutes from "./routes";
import { connectDB } from "./db";
import { initSocket } from "./socket";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);
app.use(express.json());
app.use("/", apiRoutes);

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  }
});

initSocket(io);

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
