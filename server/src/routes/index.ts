import { Router } from "express";
import auth from "./auth.routes";
import chat from "./chat.routes";
import message from "./message.routes";

const router = Router();
router.use("/auth", auth);
router.use("/chats", chat);
router.use("/chats", message);

export default router;
