import { Request, Response } from "express";
import Chat from "../models/Chat";
import Message from "../models/Message";

export async function getChats(req: Request, res: Response) {
  const userId = (req as any).userId;
  const chats = await Chat.find({ members: userId }).populate("members");
  res.json(chats);
}

export async function getMessages(req: Request, res: Response) {
  const { chatId } = req.params;
  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
  res.json(messages);
}

export async function postMessage(req: Request, res: Response) {
  const { chatId, content } = req.body;
  const msg = await Message.create({
    chatId,
    content,
    senderId: (req as any).userId
  });
  res.json(msg);
}
