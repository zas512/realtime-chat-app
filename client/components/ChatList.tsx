import type { ChatDTO } from '../../shared/types'

type Props = {
  chats: ChatDTO[]
  activeChatId: string | null
  onSelect: (chat: ChatDTO) => void
  loading: boolean
}

export default function ChatList({ chats, activeChatId, onSelect, loading }: Props) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Chats</p>
          <p className="text-lg font-semibold text-slate-900">Your conversations</p>
        </div>
      </div>

      {loading && chats.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">Loading chats…</div>
      ) : chats.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">No chats available yet.</div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const name = chat.name || chat.members.map((member) => member.name).join(', ')
            const isActive = chat._id === activeChatId
            return (
              <button
                key={chat._id}
                type="button"
                onClick={() => onSelect(chat)}
                className={`flex w-full flex-col gap-1 rounded-3xl border px-4 py-4 text-left transition ${
                  isActive ? 'border-slate-300 bg-slate-100 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-semibold text-slate-900">{name}</span>
                <span className="text-sm text-slate-500">{chat.members.length} member{chat.members.length === 1 ? '' : 's'}</span>
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
