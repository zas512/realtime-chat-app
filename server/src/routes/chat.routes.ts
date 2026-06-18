import { Router } from "express";
import {
  getChats,
  getChat,
  createDirectChat,
  createGroupChat,
  updateGroupChat,
  addMembers,
  removeMember,
  leaveChat
} from "../controllers/chat.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.get("/", getChats);
router.get("/:chatId", getChat);
router.post("/direct", createDirectChat);
router.post("/group", createGroupChat);
router.patch("/:chatId", updateGroupChat);
router.post("/:chatId/members", addMembers);
router.delete("/:chatId/members/:memberId", removeMember);
router.delete("/:chatId/leave", leaveChat);

export default router;
