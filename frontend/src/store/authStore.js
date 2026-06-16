import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      setAuth: (token, user, role) => set({ token, user, role }),
      logout: () => set({ token: null, user: null, role: null }),
    }),
    { name: 'ecoroute-auth' }
    // Note: localStorage has XSS risk. Production: use httpOnly cookies.
  )
)
