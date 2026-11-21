import { avisarExito } from '../../../store/noticeStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'

export const useUsuarios = () => useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.listar })
export function useActividadUsuario() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      usuariosApi.actividad(id, activar),
    onSuccess: async (_resultado, { activar }) => {
      avisarExito(
        activar ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.',
      )
      await client.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}
