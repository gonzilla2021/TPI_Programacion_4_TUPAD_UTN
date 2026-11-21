import type { EstadoPedido } from '../../features/pedidos/types'

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={'badge estado-' + estado}>{estado.replaceAll('_', ' ')}</span>
}
