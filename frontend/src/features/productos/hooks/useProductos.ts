import { avisarExito } from '../../../store/noticeStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../api/productos'
import type { FiltrosProductos, ProductoDatos } from '../types'

export const useProductos = (filtros: FiltrosProductos) =>
  useQuery({ queryKey: ['productos', filtros], queryFn: () => productosApi.listar(filtros) })
export function useMutacionesProductos() {
  const client = useQueryClient()
  const invalidar = () => client.invalidateQueries({ queryKey: ['productos'] })
  return {
    guardar: useMutation({
      mutationFn: ({ id, datos }: { id?: number; datos: ProductoDatos }) =>
        id ? productosApi.actualizar(id, datos) : productosApi.crear(datos),
      onSuccess: async (_resultado, { id }) => {
        avisarExito(id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.')
        await invalidar()
      },
    }),
    stock: useMutation({
      mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible: boolean }) =>
        productosApi.stock(id, stock, disponible),
      onSuccess: async () => {
        avisarExito('Stock y disponibilidad actualizados.')
        await invalidar()
      },
    }),
    eliminar: useMutation({
      mutationFn: productosApi.eliminar,
      onSuccess: async () => {
        avisarExito('Producto dado de baja.')
        await invalidar()
      },
    }),
  }
}
