import { api } from '../../../shared/api/axiosInstance'
import type { Pedido, PedidoDatos, PedidosPaginados, EstadoPedido, ResumenPedidos } from '../types'

export const pedidosApi = {
  listar: async (skip: number, estado?: EstadoPedido) =>
    (await api.get<PedidosPaginados>('/pedidos', { params: { skip, limit: 20, estado } })).data,
  detalle: async (id: number) => (await api.get<Pedido>('/pedidos/' + id)).data,
  crear: async (datos: PedidoDatos) => (await api.post<Pedido>('/pedidos', datos)).data,
  cancelar: async (id: number) => (await api.patch<Pedido>('/pedidos/' + id + '/cancelar')).data,
  cambiarEstado: async (id: number, estado: EstadoPedido) =>
    (await api.patch<Pedido>('/pedidos/' + id + '/estado', { estado })).data,
  resumen: async () => (await api.get<ResumenPedidos>('/pedidos/resumen')).data,
}
