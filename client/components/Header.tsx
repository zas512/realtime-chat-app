import type { UserDTO } from '../../shared/types'

type Props = {
  user: UserDTO
  onLogout: () => void
}

export default function Header({ user, onLogout }: Props) {
  return (
    <header className="border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 lg:px-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Realtime chat</p>
          <p className="text-xl font-semibold text-slate-900">Welcome back, {user.name}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
