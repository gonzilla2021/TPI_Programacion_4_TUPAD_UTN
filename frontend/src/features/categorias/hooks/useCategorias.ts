import { avisarExito } from '../../../store/noticeStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriasApi } from '../api/categorias'
import type { CategoriaDatos } from '../types'

export const useCategorias = () =>
  useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.listar })
export function useMutacionesCategorias() {
  const client = useQueryClient()
  const invalidar = async () => {
    // La categoría también aparece dentro de cada producto del catálogo.
    await Promise.all([
      client.invalidateQueries({ queryKey: ['categorias'] }),
      client.invalidateQueries({ queryKey: ['productos'] }),
    ])
  }
  return {
    guardar: useMutation({
      mutationFn: ({ id, datos }: { id?: number; datos: CategoriaDatos }) =>
        id ? categoriasApi.actualizar(id, datos) : categoriasApi.crear(datos),
      onSuccess: async (_resultado, { id }) => {
        avisarExito(id ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.')
        await invalidar()
      },
    }),
    eliminar: useMutation({
      mutationFn: categoriasApi.eliminar,
      onSuccess: async () => {
        avisarExito('Categoría dada de baja.')
        await invalidar()
      },
    }),
  }
}
