import type { ChatDTO } from "../types";

type Props = {
  chats: ChatDTO[];
  activeChatId: string | null;
  onSelect: (chat: ChatDTO) => void;
  onNewChat: () => void;
  loading: boolean;
};

export default function ChatList({
  chats,
  activeChatId,
  onSelect,
  onNewChat,
  loading
}: Readonly<Props>) {
  return (
    <aside className="p-4 bg-white border shadow-sm rounded-3xl border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Chats
          </p>
          <p className="text-lg font-semibold text-slate-900">
            Your conversations
          </p>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="px-4 py-2 text-sm font-semibold text-white transition rounded-full bg-slate-900 hover:bg-slate-700"
        >
          New chat
        </button>
      </div>

      {loading && chats.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-3xl border-slate-200 text-slate-500">
          Loading chats…
        </div>
      ) : chats.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-3xl border-slate-200 text-slate-500">
          No chats available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const name =
              chat.name ||
              chat.members.map((member) => member.username).join(", ");
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelect(chat)}
                className={`flex w-full flex-col gap-1 rounded-3xl border px-4 py-4 text-left transition ${
                  isActive
                    ? "border-slate-300 bg-slate-100 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="font-semibold text-slate-900">{name}</span>
                <span className="text-sm text-slate-500">
                  {chat.members.length} member
                  {chat.members.length === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
