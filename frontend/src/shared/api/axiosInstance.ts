import axios from 'axios'
import { useAuthStore } from '../../store/authStore'
import { queryClient } from './queryClient'

// withCredentials permite que el navegador envíe la cookie de sesión a la API.
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true })
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: string }>(error)) {
      const url = error.config?.url ?? ''
      const excluded = url === '/auth/token' || url === '/auth/me'
      const expired = error.response?.status === 401 && !excluded
      const disabled =
        error.response?.status === 400 &&
        error.response.data.detail === 'Cuenta de usuario desactivada'
      if (expired || disabled) {
        // ProtectedRoute redirige al login cuando la sesión deja de ser válida.
        useAuthStore.getState().limpiar()
        queryClient.clear()
      }
    }
    return Promise.reject(error)
  },
)
