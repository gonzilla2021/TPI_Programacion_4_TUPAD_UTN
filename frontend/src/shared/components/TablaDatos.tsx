import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Paginacion } from './Paginacion'
import { EstadoVacio } from './EstadoVacio'

export function TablaDatos<T>({
  datos,
  columnas,
  paginar = true,
}: {
  datos: T[]
  columnas: ColumnDef<T>[]
  paginar?: boolean
}) {
  const table = useReactTable({
    // El panel pagina los datos cargados; pedidos ya viene paginado desde la API.
    data: datos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: !paginar,
  })
  if (datos.length === 0) return <EstadoVacio />
  return (
    <>
      <div className="table-scroll">
        <table>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginar && (
        <Paginacion
          pagina={table.getState().pagination.pageIndex}
          total={datos.length}
          limite={table.getState().pagination.pageSize}
          cambiar={(pagina) => table.setPageIndex(pagina)}
        />
      )}
    </>
  )
}
