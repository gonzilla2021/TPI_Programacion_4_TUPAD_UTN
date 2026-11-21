import { useState } from 'react'
import { useMutacionesPedidos } from '../hooks/usePedidos'
import { useMisPedidos } from '../hooks/useMisPedidos'
import { DetallePedido } from '../components/DetallePedido'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Paginacion } from '../../../shared/components/Paginacion'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Modal } from '../../../shared/ui/Modal'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { dinero } from '../../../shared/money'

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalle, setDetalle] = useState<number | null>(null)
  const query = useMisPedidos(pagina)
  const { cancelar } = useMutacionesPedidos()
  const pedidos = query.data?.items ?? []
  return (
    <>
      <h1>Mis pedidos</h1>
      {cancelar.isError && <EstadoError error={cancelar.error} />}
      {query.isPending ? (
        <Skeleton />
      ) : query.isError ? (
        <EstadoError error={query.error} />
      ) : (
        <>
          {pedidos.length === 0 ? (
            <EstadoVacio mensaje="No hay pedidos propios en esta página." />
          ) : (
            <div className="space-y-4">
              {pedidos.map((p) => (
                <Card key={p.id} className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2>Pedido #{p.id}</h2>
                    <p>{new Date(p.created_at).toLocaleString('es-AR')}</p>
                    <BadgeEstado estado={p.estado} />
                  </div>
                  <strong>{dinero(p.total)}</strong>
                  <div className="actions">
                    <Button className="secondary" onClick={() => setDetalle(p.id)}>
                      Ver detalle
                    </Button>
                    {p.estado === 'PENDIENTE' && (
                      <Button
                        disabled={cancelar.isPending}
                        onClick={() => {
                          if (window.confirm('¿Querés cancelar el pedido #' + p.id + '?'))
                            cancelar.mutate(p.id)
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Paginacion pagina={pagina} total={query.data.total} limite={20} cambiar={setPagina} />
        </>
      )}
      {detalle !== null && (
        <Modal titulo={'Pedido #' + detalle} onCerrar={() => setDetalle(null)}>
          <DetallePedido id={detalle} />
        </Modal>
      )}
    </>
  )
}
