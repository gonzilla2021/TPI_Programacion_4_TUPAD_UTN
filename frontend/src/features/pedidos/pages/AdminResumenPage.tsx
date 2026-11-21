import { useResumenPedidos } from '../hooks/usePedidos'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Card } from '../../../shared/ui/Card'
import { dinero } from '../../../shared/money'

export function AdminResumenPage() {
  const query = useResumenPedidos()
  if (query.isPending) return <Skeleton />
  if (query.isError) return <EstadoError error={query.error} />
  const r = query.data
  const tarjetas = [
    ['Pendientes', r.pendientes],
    ['En preparación', r.en_preparacion],
    ['Entregados', r.entregados],
    ['Cancelados', r.cancelados],
    ['Pedidos de hoy', r.pedidos_hoy],
    ['Ingresos de entregados', dinero(r.ingresos_entregados)],
  ]
  return (
    <>
      <h1>Resumen del negocio</h1>
      <div className="summary-grid">
        {tarjetas.map(([titulo, valor]) => (
          <Card key={titulo}>
            <p className="muted">{titulo}</p>
            <strong className="summary-value">{valor}</strong>
          </Card>
        ))}
      </div>
    </>
  )
}
