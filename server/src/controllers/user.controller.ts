import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const searchUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.query;
    const currentUserId = (req as any).user.id;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { email: email as string },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        status: true
      }
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.id === currentUserId) {
      res.status(400).json({ message: "Cannot start chat with yourself" });
      return;
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
