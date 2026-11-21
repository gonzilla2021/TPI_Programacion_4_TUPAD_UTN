import { avisarExito } from '../../../store/noticeStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'
import { useAuthStore } from '../../../store/authStore'
import type { EstadoPedido } from '../types'

export function usePedidos(skip: number, estado?: EstadoPedido) {
  const usuario = useAuthStore((state) => state.usuario)
  return useQuery({
    queryKey: ['pedidos', usuario?.id, skip, estado],
    queryFn: () => pedidosApi.listar(skip, estado),
  })
}

export const useDetallePedido = (id: number) =>
  useQuery({ queryKey: ['pedido', id], queryFn: () => pedidosApi.detalle(id) })
export const useResumenPedidos = () =>
  useQuery({ queryKey: ['resumen'], queryFn: pedidosApi.resumen })
export function useMutacionesPedidos() {
  const client = useQueryClient()
  const invalidar = async () => {
    // Crear o cancelar un pedido también cambia el stock y el resumen del negocio.
    await Promise.all(
      ['pedidos', 'pedido', 'productos', 'resumen'].map((key) =>
        client.invalidateQueries({ queryKey: [key] }),
      ),
    )
  }
  return {
    crear: useMutation({
      mutationFn: pedidosApi.crear,
      onSuccess: async (pedido) => {
        avisarExito('Pedido #' + pedido.id + ' creado correctamente.')
        await invalidar()
      },
    }),
    cancelar: useMutation({
      mutationFn: pedidosApi.cancelar,
      onSuccess: async () => {
        avisarExito('Pedido cancelado correctamente.')
        await invalidar()
      },
    }),
    cambiarEstado: useMutation({
      mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
        pedidosApi.cambiarEstado(id, estado),
      onSuccess: async (_resultado, { id, estado }) => {
        const etiquetas: Record<EstadoPedido, string> = {
          PENDIENTE: 'Pendiente',
          EN_PREPARACION: 'En preparación',
          ENTREGADO: 'Entregado',
          CANCELADO: 'Cancelado',
        }
        avisarExito('Pedido #' + id + ': ' + etiquetas[estado] + '.')
        await invalidar()
      },
    }),
  }
}
