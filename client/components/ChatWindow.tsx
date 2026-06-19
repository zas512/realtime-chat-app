import type { ChatDTO, MessageDTO, MessageStatus, UserDTO } from "../types";
import { useMemo, useState } from "react";
import MessageStatusTicks from "./MessageStatusTicks";

type Props = Readonly<{
  user: UserDTO;
  chat: ChatDTO | null;
  messages: MessageDTO[];
  messageStatuses: Record<string, MessageStatus>;
  loading: boolean;
  onSend: (content: string) => void;
  typingUsers?: Record<string, boolean>;
}>;

export default function ChatWindow({
  user,
  chat,
  messages,
  messageStatuses,
  loading,
  onSend,
  typingUsers = {}
}: Props) {
  const [draft, setDraft] = useState("");

  const chatTitle = useMemo(() => {
    if (!chat) return "Select a conversation";
    return (
      chat.name ||
      chat.members
        .filter((member) => member.id !== user.id)
        .map((member) => member.username)
        .join(", ")
    );
  }, [chat, user.id]);

  const isTyping = Object.keys(typingUsers).length > 0;

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };

  const renderMessageState = () => {
    if (loading && !chat) {
      return (
        <div className="p-10 text-center border border-dashed rounded-3xl border-slate-200 text-slate-500">
          Loading messages…
        </div>
      );
    }

    if (!chat) {
      return (
        <div className="p-10 text-center border border-dashed rounded-3xl border-slate-200 text-slate-500">
          Pick a chat from the list to start messaging.
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="p-10 text-center border border-dashed rounded-3xl border-slate-200 text-slate-500">
          No messages yet. Say hello!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => {
          const isSelf = message.senderId === user.id;
          return (
            <div
              key={message.id}
              className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-6 ${isSelf ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}`}
              >
                <div className="font-medium text-slate-700">
                  {isSelf ? "You" : "Partner"}
                </div>
                <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                <div
                  className={`mt-2 flex items-center gap-1.5 text-xs ${isSelf ? "text-slate-400" : "text-slate-500"}`}
                >
                  <span>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                  <MessageStatusTicks
                    status={messageStatuses[message.id] ?? "delivered"}
                    isSelf={isSelf}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="bg-white border shadow-sm rounded-3xl border-slate-200">
      <div className="px-6 py-5 border-b border-slate-200">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
          Conversation
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          {chatTitle}
        </h2>
      </div>

      <div className="min-h-[420px] px-6 py-6">{renderMessageState()}</div>
      {isTyping && (
        <div className="px-6 pb-2 text-sm italic text-slate-500">
          Someone is typing…
        </div>
      )}

      <form
        className="px-6 py-4 border-t border-slate-200"
        onSubmit={handleSubmit}
      >
        <div className="flex gap-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!chat}
            placeholder={chat ? "Type your message..." : "Select a chat first"}
            className="w-full px-4 py-3 text-sm transition border outline-none rounded-3xl border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="submit"
            disabled={!chat || !draft.trim()}
            className="px-5 py-3 text-sm font-semibold text-white transition rounded-3xl bg-slate-900 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
