import type { ChatDTO, MessageDTO, UserDTO } from '../../shared/types'
import { useMemo, useState } from 'react'

type Props = Readonly<{
  user: UserDTO
  chat: ChatDTO | null
  messages: MessageDTO[]
  loading: boolean
  onSend: (content: string) => void
}>

export default function ChatWindow({ user, chat, messages, loading, onSend }: Props) {
  const [draft, setDraft] = useState('')

  const chatTitle = useMemo(() => {
    if (!chat) return 'Select a conversation'
    return chat.name || chat.members.filter((member) => member._id !== user._id).map((member) => member.name).join(', ')
  }, [chat, user._id])

  const handleSubmit = (event: any) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    onSend(trimmed)
    setDraft('')
  }

  const renderMessageState = () => {
    if (loading && !chat) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
          Loading messages…
        </div>
      )
    }

    if (!chat) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
          Pick a chat from the list to start messaging.
        </div>
      )
    }

    if (messages.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
          No messages yet. Say hello!
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => {
          const isSelf = message.senderId === user._id
          return (
            <div key={message._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-6 ${isSelf ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
                <div className="font-medium text-slate-700">{isSelf ? 'You' : 'Partner'}</div>
                <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                <div className="mt-2 text-xs text-slate-500">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Conversation</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{chatTitle}</h2>
      </div>

      <div className="min-h-[420px] px-6 py-6">{renderMessageState()}</div>

      <form className="border-t border-slate-200 px-6 py-4" onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!chat}
            placeholder={chat ? 'Type your message...' : 'Select a chat first'}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="submit"
            disabled={!chat || !draft.trim()}
            className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  )
}
