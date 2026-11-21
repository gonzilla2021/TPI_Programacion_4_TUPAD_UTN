import { api } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../types'

export const usuariosApi = {
  listar: async () => (await api.get<Usuario[]>('/admin/usuarios')).data,
  actividad: async (id: number, activar: boolean) =>
    (await api.post<Usuario>('/admin/usuarios/' + id + (activar ? '/activar' : '/desactivar')))
      .data,
}
