import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <section className="card">
      <h1>Sin permiso</h1>
      <p>Tu cuenta no tiene acceso a esta página.</p>
      <Link to="/">Volver al catálogo</Link>
    </section>
  )
}
