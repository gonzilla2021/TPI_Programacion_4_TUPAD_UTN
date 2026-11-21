import type { ColumnDef } from '@tanstack/react-table'
import { useUsuarios, useActividadUsuario } from '../hooks/useUsuarios'
import type { Usuario } from '../types'
import { useAuthStore } from '../../../store/authStore'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'

export function AdminUsuariosPage() {
  const query = useUsuarios()
  const actividad = useActividadUsuario()
  const usuario = useAuthStore((s) => s.usuario)
  const columnas: ColumnDef<Usuario>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) => (row.original.disabled ? 'Desactivado' : 'Activo'),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) =>
        row.original.id === usuario?.id ? (
          'Tu cuenta'
        ) : (
          <Button
            className="secondary"
            disabled={actividad.isPending}
            onClick={() =>
              actividad.mutate({ id: row.original.id, activar: row.original.disabled })
            }
          >
            {row.original.disabled ? 'Activar' : 'Desactivar'}
          </Button>
        ),
    },
  ]
  return (
    <>
      <h1>Usuarios</h1>
      {actividad.isError && <EstadoError error={actividad.error} />}
      {query.isPending ? (
        <Skeleton />
      ) : query.isError ? (
        <EstadoError error={query.error} />
      ) : (
        <TablaDatos datos={query.data} columnas={columnas} />
      )}
    </>
  )
}
