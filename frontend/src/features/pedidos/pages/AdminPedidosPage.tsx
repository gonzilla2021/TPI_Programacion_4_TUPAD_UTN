import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { usePedidos, useMutacionesPedidos } from '../hooks/usePedidos'
import type { Pedido, EstadoPedido } from '../types'
import { estados } from '../types'
import { DetallePedido } from '../components/DetallePedido'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Modal } from '../../../shared/ui/Modal'
import { Button } from '../../../shared/ui/Button'
import { dinero } from '../../../shared/money'

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [pagina, setPagina] = useState(0)
  const [detalle, setDetalle] = useState<number | null>(null)
  const query = usePedidos(pagina * 20, estado || undefined)
  const { cambiarEstado } = useMutacionesPedidos()
  const columnas: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Pedido' },
    { accessorKey: 'usuario_id', header: 'Usuario' },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
    },
    { id: 'total', header: 'Total', cell: ({ row }) => dinero(row.original.total) },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const p = row.original
        const siguiente =
          p.estado === 'PENDIENTE'
            ? 'EN_PREPARACION'
            : p.estado === 'EN_PREPARACION'
              ? 'ENTREGADO'
              : null
        return (
          <div className="actions">
            <Button className="secondary" onClick={() => setDetalle(p.id)}>
              Detalle
            </Button>
            {siguiente && (
              <Button
                disabled={cambiarEstado.isPending}
                onClick={() => cambiarEstado.mutate({ id: p.id, estado: siguiente })}
              >
                {siguiente === 'EN_PREPARACION' ? 'Preparar' : 'Entregar'}
              </Button>
            )}
            {siguiente && (
              <Button
                className="danger"
                disabled={cambiarEstado.isPending}
                onClick={() => {
                  if (window.confirm('¿Querés cancelar el pedido #' + p.id + '?'))
                    cambiarEstado.mutate({ id: p.id, estado: 'CANCELADO' })
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        )
      },
    },
  ]
  return (
    <>
      <h1>Gestión de pedidos</h1>
      <label className="filters">
        Estado
        <select
          value={estado}
          onChange={(e) => {
            const seleccionado = estados.find((item) => item === e.target.value) ?? ''
            setEstado(seleccionado)
            setPagina(0)
          }}
        >
          <option value="">Todos</option>
          {estados.map((e) => (
            <option key={e} value={e}>
              {e.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      {cambiarEstado.isError && <EstadoError error={cambiarEstado.error} />}
      {query.isPending ? (
        <Skeleton />
      ) : query.isError ? (
        <EstadoError error={query.error} />
      ) : (
        <>
          <TablaDatos datos={query.data.items} columnas={columnas} paginar={false} />
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
