import "dotenv/config";
import express from "express";
import http from "node:http";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes";
import { initSocket } from "./socket";
import { initIO } from "./utils/socket";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/", apiRoutes);

const server = http.createServer(app);

const io = initSocket(server);
initIO(io);

const PORT = Number(process.env.PORT);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO ready`);
});
