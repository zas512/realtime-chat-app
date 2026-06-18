import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const chats = await prisma.chatMember.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    status: true
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                attachments: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: "desc" }
    });
    res.status(200).json({ chats: chats.map((m) => m.chat) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { chatId } = req.params;
    const member = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } }
    });
    if (!member) {
      res.status(403).json({ message: "Not a member of this chat" });
      return;
    }
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                status: true
              }
            }
          }
        }
      }
    });
    res.status(200).json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createDirectChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { targetUserId } = req.body;
    if (!targetUserId) {
      res.status(400).json({ message: "targetUserId is required" });
      return;
    }
    if (targetUserId === userId) {
      res.status(400).json({ message: "Cannot chat with yourself" });
      return;
    }
    const existing = await prisma.chat.findFirst({
      where: {
        type: "direct",
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                status: true
              }
            }
          }
        }
      }
    });
    if (existing) {
      res.status(200).json({ chat: existing });
      return;
    }
    const chat = await prisma.chat.create({
      data: {
        type: "direct",
        createdBy: userId,
        members: {
          create: [
            { userId, role: "admin", joinedAt: new Date() },
            { userId: targetUserId, role: "member", joinedAt: new Date() }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                status: true
              }
            }
          }
        }
      }
    });
    res.status(201).json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createGroupChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, memberIds } = req.body;
    if (!name) {
      res.status(400).json({ message: "Group name is required" });
      return;
    }
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      res.status(400).json({ message: "At least one member is required" });
      return;
    }
    const otherMembers = [...new Set(memberIds)].filter((id) => id !== userId);
    const chat = await prisma.chat.create({
      data: {
        type: "group",
        name,
        createdBy: userId,
        members: {
          create: [
            { userId, role: "admin", joinedAt: new Date() },
            ...otherMembers.map((id: string) => ({
              userId: id,
              role: "member" as const,
              joinedAt: new Date()
            }))
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                status: true
              }
            }
          }
        }
      }
    });
    res.status(201).json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateGroupChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { chatId } = req.params;
    const { name, avatarUrl } = req.body;
    const member = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } }
    });
    if (member?.role !== "admin") {
      res.status(403).json({ message: "Only admins can update the group" });
      return;
    }
    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: { name, avatarUrl }
    });
    res.status(200).json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addMembers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { chatId } = req.params;
    const { memberIds } = req.body;
    const member = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } }
    });
    if (member?.role !== "admin") {
      res.status(403).json({ message: "Only admins can add members" });
      return;
    }
    const existing = await prisma.chatMember.findMany({
      where: { chatId },
      select: { userId: true }
    });
    const existingIds = new Set(existing.map((m) => m.userId));
    const newIds = memberIds.filter((id: string) => !existingIds.has(id));
    await prisma.chatMember.createMany({
      data: newIds.map((id: string) => ({
        chatId,
        userId: id,
        role: "member" as const,
        joinedAt: new Date()
      }))
    });
    res.status(200).json({ message: "Members added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const removeMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { chatId, memberId } = req.params;
    const member = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } }
    });
    if (member?.role !== "admin") {
      res.status(403).json({ message: "Only admins can remove members" });
      return;
    }
    await prisma.chatMember.delete({
      where: { chatId_userId: { chatId, userId: memberId } }
    });
    res.status(200).json({ message: "Member removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const leaveChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { chatId } = req.params;
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (chat?.type === "direct") {
      res.status(400).json({ message: "Cannot leave a direct chat" });
      return;
    }
    await prisma.chatMember.delete({
      where: { chatId_userId: { chatId, userId } }
    });
    res.status(200).json({ message: "Left the group" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
