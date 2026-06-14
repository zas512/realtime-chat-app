"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api, setAuthToken } from "../services/api";
import { createSocket } from "../lib/socket";
import Header from "../components/Header";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import AuthPanel from "../components/AuthPanel";
import { SocketEvents } from "../../shared/constants/socketEvents";
import type { ChatDTO, MessageDTO, UserDTO } from "../../shared/types";

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export default function Page() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatDTO[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("chat-user");
    const storedToken = localStorage.getItem("chat-token");

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser) as UserDTO;
      setUser(parsedUser);
      setToken(storedToken);
      setAuthToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchChats().finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !activeChatId) return;
    setLoading(true);
    fetchMessages(activeChatId).finally(() => setLoading(false));
  }, [token, activeChatId]);

  const addMessageToState = (incoming: MessageDTO) => {
    setMessages((current) => {
      if (current.some((item) => item._id === incoming._id)) return current;
      return [...current, incoming];
    });
  };

  useEffect(() => {
    if (!token) return;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on(SocketEvents.MESSAGE, addMessageToState);

    return () => {
      socket.off(SocketEvents.MESSAGE, addMessageToState);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeChatId) return;

    socket.emit(SocketEvents.JOIN, activeChatId);
    return () => {
      socket.emit(SocketEvents.LEAVE, activeChatId);
    };
  }, [activeChatId]);

  const fetchChats = async () => {
    try {
      const response = await api.get<ChatDTO[]>("/chats");
      setChats(response.data);
      if (!activeChatId && response.data.length > 0) {
        setActiveChatId(response.data[0]._id);
      }
    } catch (err) {
      setError("Unable to load chats.");
      console.error(err);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await api.get<MessageDTO[]>(`/chats/${chatId}/messages`);
      setMessages(response.data);
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
      const response = await api.post(url, values);
      const { user: authUser, token: authToken } = response.data;
      setUser(authUser);
      setToken(authToken);
      setAuthToken(authToken);
      localStorage.setItem("chat-user", JSON.stringify(authUser));
      localStorage.setItem("chat-token", authToken);
      setAuthMode("login");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Authentication failed.";
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setChats([]);
    setMessages([]);
    setActiveChatId(null);
    setError(null);
    setAuthToken(null);
    localStorage.removeItem("chat-user");
    localStorage.removeItem("chat-token");
  };

  const handleSend = async (content: string) => {
    if (!activeChatId || !user) return;

    try {
      const response = await api.post<MessageDTO>("/chats/message", {
        chatId: activeChatId,
        content
      });
      const sentMessage = response.data;

      setMessages((current) => {
        if (current.some((message) => message._id === sentMessage._id))
          return current;
        return [...current, sentMessage];
      });

      socketRef.current?.emit(SocketEvents.MESSAGE, sentMessage);
    } catch (err) {
      setError("Unable to send message.");
      console.error(err);
    }
  };

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === activeChatId) ?? null,
    [chats, activeChatId]
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
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
          onSelect={(chat) => setActiveChatId(chat._id)}
          loading={loading}
        />
        <ChatWindow
          user={user}
          chat={activeChat}
          messages={messages}
          loading={loading}
          onSend={handleSend}
        />
      </div>
    </main>
  );
}
