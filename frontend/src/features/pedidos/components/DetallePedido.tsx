import { useDetallePedido } from '../hooks/usePedidos'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { dinero } from '../../../shared/money'

export function DetallePedido({ id }: { id: number }) {
  const query = useDetallePedido(id)
  if (query.isPending) return <Skeleton />
  if (query.isError) return <EstadoError error={query.error} />
  const pedido = query.data
  return (
    <div className="space-y-3 mt-4">
      <BadgeEstado estado={pedido.estado} />
      <p>Fecha: {new Date(pedido.created_at).toLocaleString('es-AR')}</p>
      <p>Entrega: {pedido.direccion_entrega}</p>
      <p>Pago: {pedido.forma_pago}</p>
      {pedido.notas && <p>Notas: {pedido.notas}</p>}
      <ul>
        {pedido.items.map((item) => (
          <li key={item.producto_id} className="py-2 border-b border-slate-200">
            {item.cantidad} × {item.nombre_producto} · {dinero(item.precio_unitario)} ={' '}
            {dinero(item.subtotal)}
          </li>
        ))}
      </ul>
      <p>
        <strong>Total: {dinero(pedido.total)}</strong>
      </p>
    </div>
  )
}
