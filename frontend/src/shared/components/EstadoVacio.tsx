export function EstadoVacio({ mensaje = 'No hay resultados para mostrar' }: { mensaje?: string }) {
  return <p className="empty">{mensaje}</p>
}
