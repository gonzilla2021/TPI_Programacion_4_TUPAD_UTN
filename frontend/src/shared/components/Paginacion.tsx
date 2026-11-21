import { Button } from '../ui/Button'

export function Paginacion({
  pagina,
  total,
  limite,
  cambiar,
}: {
  pagina: number
  total: number
  limite: number
  cambiar: (pagina: number) => void
}) {
  const paginas = Math.max(1, Math.ceil(total / limite))
  return (
    <nav aria-label="Paginación" className="pagination">
      <Button className="secondary" disabled={pagina === 0} onClick={() => cambiar(pagina - 1)}>
        Anterior
      </Button>
      <span>
        Página {pagina + 1} de {paginas} · {total} resultados
      </span>
      <Button
        className="secondary"
        disabled={pagina + 1 >= paginas}
        onClick={() => cambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </nav>
  )
}
