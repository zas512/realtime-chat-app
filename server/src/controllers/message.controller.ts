import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { chatId } = req.params;
    const { cursor, limit = 30 } = req.query;
    const member = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } }
    });
    if (!member) {
      res.status(403).json({ message: "Not a member of this chat" });
      return;
    }
    const messages = await prisma.message.findMany({
      where: { chatId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor as string }
      }),
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true }
        },
        repliedTo: {
          include: {
            sender: {
              select: { id: true, username: true }
            },
            attachments: true
          }
        },
        attachments: true,
        reads: {
          select: { userId: true, readAt: true }
        }
      }
    });
    const nextCursor =
      messages.length === Number(limit) ? messages.at(-1)?.id : null;
    res.status(200).json({ messages: messages.toReversed(), nextCursor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { chatId } = req.params;
    const { content, replyToId, attachments } = req.body;
    const member = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } }
    });
    if (!member) {
      res.status(403).json({ message: "Not a member of this chat" });
      return;
    }
    if (!content && (!attachments || attachments.length === 0)) {
      res
        .status(400)
        .json({ message: "Message must have content or attachments" });
      return;
    }
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        content,
        replyToId: replyToId || null,
        attachments: attachments?.length
          ? {
              create: attachments.map(
                (a: {
                  type: string;
                  url: string;
                  mimeType: string;
                  sizeBytes: number;
                  durationMs?: number;
                  thumbnailUrl?: string;
                }) => ({
                  type: a.type,
                  url: a.url,
                  mimeType: a.mimeType,
                  sizeBytes: a.sizeBytes,
                  durationMs: a.durationMs || null,
                  thumbnailUrl: a.thumbnailUrl || null
                })
              )
            }
          : undefined
      },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true }
        },
        repliedTo: {
          include: {
            sender: { select: { id: true, username: true } },
            attachments: true
          }
        },
        attachments: true
      }
    });
    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const editMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { messageId } = req.params;
    const { content } = req.body;
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    if (message.senderId !== userId) {
      res.status(403).json({ message: "Cannot edit someone else message" });
      return;
    }
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content }
    });
    res.status(200).json({ message: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { messageId } = req.params;
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    if (message.senderId !== userId) {
      res.status(403).json({ message: "Cannot delete someone else message" });
      return;
    }
    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true }
    });
    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { chatId, messageId } = req.params;
    await prisma.messageRead.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId, readAt: new Date() },
      update: { readAt: new Date() }
    });
    await prisma.chatMember.update({
      where: { chatId_userId: { chatId, userId } },
      data: { lastReadAt: new Date() }
    });
    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
