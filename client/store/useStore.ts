import create from 'zustand'

type State = {
  user: any | null
  setUser: (u: any) => void
}

export const useStore = create<State>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}))
