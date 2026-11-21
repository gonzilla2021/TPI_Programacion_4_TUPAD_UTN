import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../features/auth/api/auth'
import type { Usuario } from '../features/auth/types'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiar: () => void
}

// Se persiste el usuario para la interfaz; el token permanece en la cookie HttpOnly.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      limpiar: () => set({ usuario: null, cargando: false }),
      login: async (username, password) => {
        await authApi.login(username, password)
        queryClient.clear()
        set({ usuario: await authApi.me(), cargando: false })
      },
      logout: async () => {
        await authApi.logout()
        queryClient.clear()
        set({ usuario: null, cargando: false })
      },
      checkSession: async () => {
        try {
          const usuario = await authApi.me()

          // Hay sesión: conservar el carrito.
          set({ usuario, cargando: false })
        } catch {
          // El carrito es público y se conserva aunque no haya una sesión válida.
          set({ usuario: null, cargando: false })
        }
      },
    }),
    { name: 'foodstore-sesion', partialize: (state) => ({ usuario: state.usuario }) },
  ),
)
