import { api } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../types'

export const authApi = {
  login: async (username: string, password: string) => {
    await api.post('/auth/token', new URLSearchParams({ username, password }))
  },
  me: async () => (await api.get<Usuario>('/auth/me')).data,
  logout: async () => {
    await api.post('/auth/logout')
  },
  registrar: async (datos: {
    username: string
    full_name: string
    email: string
    password: string
  }) => (await api.post<Usuario>('/auth/register', datos)).data,
}
