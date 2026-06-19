import { useState, type FormEvent } from "react";
import { api } from "../services/api";
import type { ChatDTO, UserDTO } from "../types";

type Props = Readonly<{
  open: boolean;
  onClose: () => void;
  onChatStarted: (chat: ChatDTO) => void;
}>;

export default function NewChatDialog({ open, onClose, onChatStarted }: Props) {
  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState<UserDTO | null>(null);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setEmail("");
    setFoundUser(null);
    setError(null);
    setSearching(false);
    setStarting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const normalizeChat = (chat: ChatDTO): ChatDTO => ({
    ...chat,
    members: chat.members.map((member) =>
      "user" in member && member.user ? member.user : member
    ) as ChatDTO["members"]
  });

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSearching(true);
    setError(null);
    setFoundUser(null);

    try {
      const response = await api.get<{ user: UserDTO }>("/users/search", {
        params: { email: trimmed }
      });
      setFoundUser(response.data.user);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Unable to find user with that email.";
      setError(message);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async () => {
    if (!foundUser) return;

    setStarting(true);
    setError(null);

    try {
      const response = await api.post<{ chat: ChatDTO }>("/chats/direct", {
        targetUserId: foundUser.id
      });
      const chat = normalizeChat(response.data.chat);
      onChatStarted(chat);
      handleClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Unable to start chat.";
      setError(message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div
        className="w-full max-w-md p-6 bg-white border shadow-xl rounded-3xl border-slate-200"
        role="dialog"
        aria-labelledby="new-chat-title"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              New conversation
            </p>
            <h2
              id="new-chat-title"
              className="mt-1 text-xl font-semibold text-slate-900"
            >
              Start chat by email
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1 text-sm text-slate-500 transition rounded-full hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSearch}>
          <label className="block text-sm font-medium text-slate-700">
            <p>Email address</p>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFoundUser(null);
                setError(null);
              }}
              placeholder="colleague@company.com"
              required
              className="w-full px-4 py-3 mt-2 text-sm transition border outline-none rounded-3xl border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {error && (
            <p className="px-4 py-3 text-sm rounded-3xl bg-rose-100 text-rose-700">
              {error}
            </p>
          )}

          {foundUser && (
            <div className="flex items-center gap-3 px-4 py-3 border rounded-3xl border-slate-200 bg-slate-50">
              <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-full bg-slate-900 text-white">
                {(foundUser.username ?? foundUser.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {foundUser.username ?? "User"}
                </p>
                <p className="text-sm text-slate-500">{foundUser.email}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-sm font-semibold transition border rounded-3xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            {foundUser ? (
              <button
                type="button"
                onClick={handleStartChat}
                disabled={starting}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white transition rounded-3xl bg-slate-900 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {starting ? "Starting…" : "Start chat"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={searching || !email.trim()}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white transition rounded-3xl bg-slate-900 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {searching ? "Searching…" : "Find user"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
