import type { ReactNode } from 'react'
import { Button } from './Button'

export function Modal({
  titulo,
  onCerrar,
  children,
}: {
  titulo: string
  onCerrar: () => void
  children: ReactNode
}) {
  return (
    <div className="modal-backdrop" onClick={onCerrar}>
      <section
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-4">
          <h2 id="modal-title">{titulo}</h2>
          <Button className="secondary" onClick={onCerrar} aria-label="Cerrar">
            Cerrar
          </Button>
        </div>
        {children}
      </section>
    </div>
  )
}
