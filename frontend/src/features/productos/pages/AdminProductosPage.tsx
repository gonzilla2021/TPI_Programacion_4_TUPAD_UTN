import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useProductos, useMutacionesProductos } from '../hooks/useProductos'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import type { Producto } from '../types'
import { ProductoFormulario } from '../components/ProductoFormulario'
import { Formulario } from '../../../shared/components/Formulario'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { dinero } from '../../../shared/money'

export function AdminProductosPage() {
  const query = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const { guardar, eliminar, stock } = useMutacionesProductos()
  const [editando, setEditando] = useState<Producto | null | undefined>(undefined)
  const [ajuste, setAjuste] = useState<Producto | null>(null)
  const columnas: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Producto' },
    { id: 'categoria', header: 'Categoría', cell: ({ row }) => row.original.categoria.nombre },
    { id: 'precio', header: 'Precio', cell: ({ row }) => dinero(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' },
    {
      id: 'disponible',
      header: 'Disponible',
      cell: ({ row }) => (row.original.disponible ? 'Sí' : 'No'),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="actions">
          <Button className="secondary" onClick={() => setEditando(row.original)}>
            Editar
          </Button>
          <Button className="secondary" onClick={() => setAjuste(row.original)}>
            Stock
          </Button>
          <Button
            className="danger"
            disabled={eliminar.isPending}
            onClick={() => {
              if (window.confirm('¿Querés dar de baja «' + row.original.nombre + '»?'))
                eliminar.mutate(row.original.id)
            }}
          >
            Dar de baja
          </Button>
        </div>
      ),
    },
  ]
  return (
    <>
      <div className="page-heading">
        <h1>Productos</h1>
        <Button disabled={!categorias.data?.length} onClick={() => setEditando(null)}>
          Nuevo producto
        </Button>
      </div>
      {categorias.isError && <EstadoError error={categorias.error} />}
      {categorias.data?.length === 0 && <p>Creá una categoría antes de cargar productos.</p>}
      {eliminar.isError && <EstadoError error={eliminar.error} />}
      {query.isPending ? (
        <Skeleton />
      ) : query.isError ? (
        <EstadoError error={query.error} />
      ) : (
        <TablaDatos datos={query.data.items} columnas={columnas} />
      )}
      {editando !== undefined && (
        <Modal
          titulo={editando ? 'Editar producto' : 'Nuevo producto'}
          onCerrar={() => setEditando(undefined)}
        >
          <ProductoFormulario
            producto={editando}
            categorias={categorias.data ?? []}
            guardar={async (datos) => {
              await guardar.mutateAsync({ id: editando?.id, datos })
              setEditando(undefined)
            }}
          />
        </Modal>
      )}
      {ajuste && (
        <Modal titulo={'Stock: ' + ajuste.nombre} onCerrar={() => setAjuste(null)}>
          <Formulario
            iniciales={{ stock: String(ajuste.stock), disponible: String(ajuste.disponible) }}
            campos={[
              {
                nombre: 'stock',
                etiqueta: 'Stock',
                tipo: 'number',
                min: 0,
                step: '1',
                requerido: true,
              },
              {
                nombre: 'disponible',
                etiqueta: 'Disponibilidad',
                tipo: 'select',
                opciones: [
                  { valor: 'true', texto: 'Disponible' },
                  { valor: 'false', texto: 'No disponible' },
                ],
              },
            ]}
            enviar={async (datos) => {
              await stock.mutateAsync({
                id: ajuste.id,
                stock: Number(datos.stock),
                disponible: datos.disponible === 'true',
              })
              setAjuste(null)
            }}
          />
        </Modal>
      )}
    </>
  )
}
