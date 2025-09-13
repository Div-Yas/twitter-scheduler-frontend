import { create } from 'zustand'

type UiState = {
  mode: 'light' | 'dark'
  toggleMode: () => void
}

const getInitialMode = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('ts_mode') as 'light' | 'dark' | null
  if (saved) return saved
  return 'dark'
}

export const useUiStore = create<UiState>((set, get) => ({
  mode: getInitialMode(),
  toggleMode: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark'
    localStorage.setItem('ts_mode', next)
    set({ mode: next })
  }
}))


