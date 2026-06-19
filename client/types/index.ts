export type UserDTO = {
  id: string;
  username?: string | null;
  email: string;
  avatarUrl?: string | null;
  status: "online" | "offline" | "away";
  lastSeenAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatDTO = {
  id: string;
  type: "direct" | "group";
  name?: string | null;
  avatarUrl?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: UserDTO[];
  lastMessage?: MessageDTO | null;
};

export type AttachmentDTO = {
  id: string;
  type: "image" | "video" | "audio" | "file";
  url: string;
  mimeType: string;
  sizeBytes: number;
  durationMs?: number | null;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageDTO = {
  id: string;
  chatId: string;
  senderId: string;
  content?: string | null;
  replyToId?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender: UserDTO;
  repliedTo?: MessageDTO | null;
  attachments: AttachmentDTO[];
  reads: Array<{
    userId: string;
    readAt: string;
  }>;
};

export type ChatMemberDTO = {
  id: string;
  chatId: string;
  userId: string;
  role: "admin" | "member";
  joinedAt: string;
  lastReadAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: UserDTO;
  chat: ChatDTO;
};

export type AuthResponse = {
  user: UserDTO;
  token?: string;
};

export type CreateDirectChatPayload = {
  targetUserId: string;
};

export type CreateGroupChatPayload = {
  name: string;
  memberIds: string[];
};

export type UpdateGroupChatPayload = {
  name?: string;
  avatarUrl?: string;
};

export type AddMembersPayload = {
  memberIds: string[];
};

export type MessageStatus = "sending" | "delivered" | "read";

export type SendMessagePayload = {
  chatId: string;
  content?: string;
  replyToId?: string;
  attachments?: Array<{
    type: "image" | "video" | "audio" | "file";
    url: string;
    mimeType: string;
    sizeBytes: number;
    durationMs?: number;
    thumbnailUrl?: string;
  }>;
};
