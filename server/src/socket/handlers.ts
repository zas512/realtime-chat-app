import { Server, Socket } from "socket.io";
import type { AttachmentType } from "@prisma/client";
import prisma from "../utils/prisma";

export const registerSocketHandlers = (io: Server, socket: Socket): void => {
  const user = socket.data.user;
  prisma.chatMember
    .findMany({
      where: { userId: user.id },
      select: { chatId: true }
    })
    .then((memberships) => {
      memberships.forEach(({ chatId }) => {
        socket.join(chatId);
        console.log(`User ${user.id} joined room ${chatId}`);
      });
    })
    .catch((err) => console.log(`Failed to join rooms: ${err}`));
  prisma.user
    .update({
      where: { id: user.id },
      data: { status: "online", lastSeenAt: new Date() }
    })
    .catch((err) => console.log(`Failed to update status: ${err}`));
  socket.broadcast.emit("user:online", { userId: user.id });

  socket.on("typing:start", ({ chatId }: { chatId: string }) => {
    console.log(`User ${user.id} typing in ${chatId}`);
    socket.to(chatId).emit("typing:start", { userId: user.id, chatId });
  });

  socket.on("typing:stop", ({ chatId }: { chatId: string }) => {
    socket.to(chatId).emit("typing:stop", { userId: user.id, chatId });
  });

  socket.on(
    "message:send",
    async ({
      chatId,
      content,
      replyToId,
      attachments
    }: {
      chatId: string;
      content?: string;
      replyToId?: string;
      attachments?: {
        type: AttachmentType;
        url: string;
        mimeType: string;
        sizeBytes: number;
        durationMs?: number;
        thumbnailUrl?: string;
      }[];
    }) => {
      try {
        const member = await prisma.chatMember.findUnique({
          where: { chatId_userId: { chatId, userId: user.id } }
        });
        if (!member) {
          socket.emit("error", { message: "Not a member of this chat" });
          return;
        }
        if (!content && (!attachments || attachments.length === 0)) {
          socket.emit("error", {
            message: "Message must have content or attachments"
          });
          return;
        }
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: user.id,
            content,
            replyToId: replyToId || null,
            attachments: attachments?.length
              ? {
                  create: attachments.map((a) => ({
                    type: a.type,
                    url: a.url,
                    mimeType: a.mimeType,
                    sizeBytes: a.sizeBytes,
                    durationMs: a.durationMs || null,
                    thumbnailUrl: a.thumbnailUrl || null
                  }))
                }
              : undefined
          },
          include: {
            sender: { select: { id: true, username: true, avatarUrl: true } },
            repliedTo: {
              include: {
                sender: { select: { id: true, username: true } },
                attachments: true
              }
            },
            attachments: true
          }
        });
        console.log(`Message sent by ${user.id} in chat ${chatId}`);
        io.to(chatId).emit("message:new", { message });
        socket.emit("message:delivered", { messageId: message.id, chatId });
      } catch (err) {
        console.log(`message:send error: ${err}`);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );

  socket.on(
    "message:edit",
    async ({ messageId, content }: { messageId: string; content: string }) => {
      try {
        const message = await prisma.message.findUnique({
          where: { id: messageId }
        });
        if (!message || message.senderId !== user.id) {
          socket.emit("error", { message: "Cannot edit this message" });
          return;
        }
        const updated = await prisma.message.update({
          where: { id: messageId },
          data: { content },
          include: {
            sender: { select: { id: true, username: true, avatarUrl: true } },
            attachments: true
          }
        });
        console.log(`Message ${messageId} edited by ${user.id}`);
        io.to(message.chatId).emit("message:edited", { message: updated });
      } catch (err) {
        console.log(`message:edit error: ${err}`);
        socket.emit("error", { message: "Failed to edit message" });
      }
    }
  );

  socket.on("message:delete", async ({ messageId }: { messageId: string }) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId }
      });
      if (!message || message.senderId !== user.id) {
        socket.emit("error", { message: "Cannot delete this message" });
        return;
      }
      await prisma.message.update({
        where: { id: messageId },
        data: { isDeleted: true }
      });
      console.log(`Message ${messageId} deleted by ${user.id}`);
      io.to(message.chatId).emit("message:deleted", {
        messageId,
        chatId: message.chatId
      });
    } catch (err) {
      console.log(`message:delete error: ${err}`);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  socket.on(
    "message:read",
    async ({ messageId, chatId }: { messageId: string; chatId: string }) => {
      try {
        await prisma.messageRead.upsert({
          where: { messageId_userId: { messageId, userId: user.id } },
          create: { messageId, userId: user.id, readAt: new Date() },
          update: { readAt: new Date() }
        });
        await prisma.chatMember.update({
          where: { chatId_userId: { chatId, userId: user.id } },
          data: { lastReadAt: new Date() }
        });
        console.log(`Message ${messageId} read by ${user.id}`);
        socket
          .to(chatId)
          .emit("message:read", { messageId, userId: user.id, chatId });
      } catch (err) {
        console.log(`message:read error: ${err}`);
      }
    }
  );

  socket.on("chat:join", ({ chatId }: { chatId: string }) => {
    socket.join(chatId);
    console.log(`User ${user.id} manually joined room ${chatId}`);
  });

  socket.on("chat:leave", ({ chatId }: { chatId: string }) => {
    socket.leave(chatId);
    console.log(`User ${user.id} left room ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User ${user.id} disconnected — socket ${socket.id}`);
    prisma.user
      .update({
        where: { id: user.id },
        data: { status: "offline", lastSeenAt: new Date() }
      })
      .catch((err) => console.log(`Failed to update status: ${err}`));
    socket.broadcast.emit("user:offline", { userId: user.id });
  });
};
