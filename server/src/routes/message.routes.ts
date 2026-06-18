import { Router } from "express";
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead
} from "../controllers/message.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);
router.patch("/:chatId/messages/:messageId", editMessage);
router.delete("/:chatId/messages/:messageId", deleteMessage);
router.post("/:chatId/messages/:messageId/read", markAsRead);

export default router;
