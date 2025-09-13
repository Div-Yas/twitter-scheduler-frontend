import { create } from 'zustand'

type User = { _id: string; email: string; name?: string; avatar?: string }

type AuthState = {
  token: string | null
  user: User | null
  setAuth: (payload: { token: string; user: User }) => void
  logout: () => void
  restore: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: ({ token, user }) => {
    localStorage.setItem('ts_token', token)
    localStorage.setItem('ts_user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('ts_token')
    localStorage.removeItem('ts_user')
    set({ token: null, user: null })
  },
  restore: () => {
    const token = localStorage.getItem('ts_token')
    const userStr = localStorage.getItem('ts_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User
        set({ token, user })
      } catch {}
    }
  }
}))


