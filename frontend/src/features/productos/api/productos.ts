import { api } from '../../../shared/api/axiosInstance'
import type { Producto, ProductoDatos, ProductosPaginados, FiltrosProductos } from '../types'

export const productosApi = {
  listar: async (filtros: FiltrosProductos) =>
    (await api.get<ProductosPaginados>('/productos', { params: filtros })).data,
  crear: async (datos: ProductoDatos) => (await api.post<Producto>('/productos', datos)).data,
  actualizar: async (id: number, datos: ProductoDatos) =>
    (await api.put<Producto>('/productos/' + id, datos)).data,
  stock: async (id: number, stock: number, disponible: boolean) =>
    (await api.patch<Producto>('/productos/' + id + '/stock', { stock, disponible })).data,
  eliminar: async (id: number) => {
    await api.delete('/productos/' + id)
  },
}
