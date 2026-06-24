import { create } from 'zustand'
import type { User } from '@/lib/api'
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '@/lib/api'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    const user = await apiLogin(email, password)
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    apiLogout()
    set({ user: null, isAuthenticated: false })
  },
  checkAuth: async () => {
    try {
      const user = await getCurrentUser()
      set({ user, isAuthenticated: !!user, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
