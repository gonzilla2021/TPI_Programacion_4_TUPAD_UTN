import { useEffect } from 'react'
import { useNoticeStore } from '../../store/noticeStore'

const DURACION_AVISO_MS = 3000

function Aviso({ id, mensaje }: { id: number; mensaje: string }) {
  const cerrar = useNoticeStore((state) => state.cerrar)

  // Cada aviso tiene su propio plazo; al desmontarse se limpia el temporizador.
  useEffect(() => {
    const timer = window.setTimeout(() => cerrar(id), DURACION_AVISO_MS)
    return () => window.clearTimeout(timer)
  }, [id, cerrar])

  return (
    <div className="success-notice">
      <span className="success-notice-icon" aria-hidden="true">
        FS
      </span>
      <p>{mensaje}</p>
      <button
        type="button"
        className="success-notice-close"
        onClick={() => cerrar(id)}
        aria-label="Cerrar aviso"
      >
        ×
      </button>
    </div>
  )
}

export function Avisos() {
  const avisos = useNoticeStore((state) => state.avisos)
  return (
    <div
      className="success-notices"
      role="status"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {avisos.map((aviso) => (
        <Aviso key={aviso.id} {...aviso} />
      ))}
    </div>
  )
}
