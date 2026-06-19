"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";
import { createSocket } from "../lib/socket";
import Header from "../components/Header";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import AuthPanel from "../components/AuthPanel";
import NewChatDialog from "../components/NewChatDialog";
import type { ChatDTO, MessageDTO, MessageStatus, UserDTO } from "../types";

type AuthPayload = {
  email: string;
  password: string;
  username?: string;
};

function normalizeChat(chat: ChatDTO): ChatDTO {
  return {
    ...chat,
    members: chat.members.map((member) =>
      "user" in member && (member as { user?: UserDTO }).user
        ? (member as { user: UserDTO }).user
        : member
    ) as ChatDTO["members"]
  };
}

function buildMessageStatuses(
  msgs: MessageDTO[],
  currentUserId: string,
  chat: ChatDTO | null
): Record<string, MessageStatus> {
  if (!chat) return {};

  const otherMemberIds = chat.members
    .filter((member) => member.id !== currentUserId)
    .map((member) => member.id);

  const statuses: Record<string, MessageStatus> = {};
  for (const msg of msgs) {
    if (msg.senderId !== currentUserId) continue;
    const readByOther = msg.reads.some((read) =>
      otherMemberIds.includes(read.userId)
    );
    statuses[msg.id] = readByOther ? "read" : "delivered";
  }
  return statuses;
}

export default function Page() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [chats, setChats] = useState<ChatDTO[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [messageStatuses, setMessageStatuses] = useState<
    Record<string, MessageStatus>
  >({});
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [newChatOpen, setNewChatOpen] = useState(false);
  const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const chatsRef = useRef<ChatDTO[]>([]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get<{ user: UserDTO }>("/auth/me");
        setUser(response.data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchChats().finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !activeChatId) return;
    setLoading(true);
    fetchMessages(activeChatId).finally(() => setLoading(false));
  }, [user, activeChatId]);

  useEffect(() => {
    if (!user) return;
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("message:new", (data: { message: MessageDTO }) => {
      setMessages((current) => {
        if (current.some((m) => m.id === data.message.id)) return current;
        return [...current, data.message];
      });

      if (data.message.senderId === user.id) {
        setMessageStatuses((current) => ({
          ...current,
          [data.message.id]: "sending"
        }));
      } else if (data.message.chatId === activeChatIdRef.current) {
        socket.emit("message:read", {
          messageId: data.message.id,
          chatId: data.message.chatId
        });
      }
    });

    socket.on("message:edited", (data: { message: MessageDTO }) => {
      setMessages((current) =>
        current.map((m) => (m.id === data.message.id ? data.message : m))
      );
    });

    socket.on("message:deleted", (data: { messageId: string }) => {
      setMessages((current) => current.filter((m) => m.id !== data.messageId));
      setMessageStatuses((current) => {
        const next = { ...current };
        delete next[data.messageId];
        return next;
      });
    });

    socket.on(
      "message:delivered",
      (data: { messageId: string; chatId: string }) => {
        setMessageStatuses((current) => ({
          ...current,
          [data.messageId]: "delivered"
        }));
      }
    );

    socket.on(
      "message:read",
      (data: { messageId: string; userId: string; chatId: string }) => {
        if (data.userId === user.id) return;
        setMessageStatuses((current) => ({
          ...current,
          [data.messageId]: "read"
        }));
      }
    );

    socket.on("typing:start", (data: { userId: string; chatId: string }) => {
      if (data.userId !== user.id) {
        setTypingUsers((s) => ({ ...s, [data.userId]: true }));
      }
    });

    socket.on("typing:stop", (data: { userId: string }) => {
      setTypingUsers((s) => {
        const copy = { ...s };
        delete copy[data.userId];
        return copy;
      });
    });

    socket.on("error", (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeChatId) return;
    socket.emit("chat:join", { chatId: activeChatId });
    return () => {
      socket.emit("chat:leave", { chatId: activeChatId });
    };
  }, [activeChatId]);

  const fetchChats = async () => {
    try {
      const response = await api.get<{ chats: ChatDTO[] }>("/chats");
      const data = (response.data.chats ?? []).map(normalizeChat);
      setChats(data);
      if (!activeChatId && data.length > 0) {
        setActiveChatId(data[0].id);
      }
    } catch (err) {
      setError("Unable to load chats.");
      console.error(err);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await api.get<{ messages: MessageDTO[] }>(
        `/chats/${chatId}/messages`
      );
      const data = response.data.messages ?? [];
      setMessages(data);

      const chat = chatsRef.current.find((item) => item.id === chatId) ?? null;
      setMessageStatuses(buildMessageStatuses(data, user!.id, chat));

      if (data.length > 0) {
        const lastMsg = data.at(-1);
        if (lastMsg && lastMsg.senderId !== user!.id) {
          socketRef.current?.emit("message:read", {
            messageId: lastMsg.id,
            chatId
          });
        }
      }
    } catch (err) {
      setError("Unable to load messages.");
      console.error(err);
    }
  };

  const handleAuth = async (
    values: AuthPayload,
    mode: "login" | "register"
  ) => {
    setLoading(true);
    setError(null);
    const url = mode === "login" ? "/auth/login" : "/auth/register";
    try {
      const response = await api.post<{ user: UserDTO }>(url, values);
      setUser(response.data.user);
      setAuthMode("login");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Authentication failed.";
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
      socketRef.current?.disconnect();
      setUser(null);
      setChats([]);
      setMessages([]);
      setMessageStatuses({});
      setActiveChatId(null);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSend = async (content: string) => {
    if (!activeChatId || !user) return;
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit(
        "message:send",
        { chatId: activeChatId, content },
        (ack: { error?: string }) => {
          if (ack?.error) {
            setError(ack.error);
          }
        }
      );
      return;
    }
    setError("Socket not connected");
  };

  const handleChatStarted = (chat: ChatDTO) => {
    const normalized = normalizeChat(chat);
    setChats((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      if (exists) {
        return current.map((item) =>
          item.id === normalized.id ? normalized : item
        );
      }
      return [normalized, ...current];
    });
    setActiveChatId(normalized.id);
    socketRef.current?.emit("chat:join", { chatId: normalized.id });
  };

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId]
  );

  if (!user) {
    return (
      <main className="min-h-screen px-4 py-8 bg-slate-50 text-slate-900">
        <div className="max-w-4xl p-8 mx-auto bg-white border shadow-xl rounded-3xl border-slate-200">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Realtime chat app
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Professional chat interface
            </h1>
            <p className="mt-3 text-slate-600">
              Sign in or register to connect with teammates instantly.
            </p>
          </div>
          <AuthPanel
            mode={authMode}
            onChangeMode={setAuthMode}
            onSubmit={handleAuth}
            error={error}
            loading={loading}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} onLogout={handleLogout} />
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[320px_1fr]">
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={(chat) => setActiveChatId(chat.id)}
          onNewChat={() => setNewChatOpen(true)}
          loading={loading}
        />
        <ChatWindow
          user={user}
          chat={activeChat}
          messages={messages}
          messageStatuses={messageStatuses}
          loading={loading}
          onSend={handleSend}
          typingUsers={typingUsers}
        />
      </div>
      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onChatStarted={handleChatStarted}
      />
    </main>
  );
}
