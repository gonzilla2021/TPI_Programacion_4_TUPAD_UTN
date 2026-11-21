import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategorias, useMutacionesCategorias } from '../hooks/useCategorias'
import type { Categoria } from '../types'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { Formulario } from '../../../shared/components/Formulario'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'

export function AdminCategoriasPage() {
  const query = useCategorias()
  const { guardar, eliminar } = useMutacionesCategorias()
  const [editando, setEditando] = useState<Categoria | null | undefined>(undefined)
  const columnas: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'descripcion', header: 'Descripción' },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="actions">
          <Button className="secondary" onClick={() => setEditando(row.original)}>
            Editar
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
        <h1>Categorías</h1>
        <Button onClick={() => setEditando(null)}>Nueva categoría</Button>
      </div>
      {eliminar.isError && <EstadoError error={eliminar.error} />}
      {query.isPending ? (
        <Skeleton />
      ) : query.isError ? (
        <EstadoError error={query.error} />
      ) : (
        <TablaDatos datos={query.data} columnas={columnas} />
      )}
      {editando !== undefined && (
        <Modal
          titulo={editando ? 'Editar categoría' : 'Nueva categoría'}
          onCerrar={() => setEditando(undefined)}
        >
          <Formulario
            iniciales={{ nombre: editando?.nombre ?? '', descripcion: editando?.descripcion ?? '' }}
            campos={[
              {
                nombre: 'nombre',
                etiqueta: 'Nombre',
                requerido: true,
                minLength: 2,
                maxLength: 100,
              },
              { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea' },
            ]}
            enviar={async (datos) => {
              await guardar.mutateAsync({
                id: editando?.id,
                datos: { nombre: datos.nombre, descripcion: datos.descripcion || null },
              })
              setEditando(undefined)
            }}
          />
        </Modal>
      )}
    </>
  )
}
