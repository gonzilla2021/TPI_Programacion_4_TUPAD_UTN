import { api } from '../../../shared/api/axiosInstance'
import type { Categoria, CategoriaDatos } from '../types'

export const categoriasApi = {
  listar: async () => (await api.get<Categoria[]>('/categorias')).data,
  crear: async (datos: CategoriaDatos) => (await api.post<Categoria>('/categorias', datos)).data,
  actualizar: async (id: number, datos: CategoriaDatos) =>
    (await api.put<Categoria>('/categorias/' + id, datos)).data,
  eliminar: async (id: number) => {
    await api.delete('/categorias/' + id)
  },
}
