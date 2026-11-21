import { avisarExito } from '../../../store/noticeStore'
import { useState } from 'react'
import type { Producto } from '../types'
import { useCartStore } from '../../../store/cartStore'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { dinero } from '../../../shared/money'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const cantidad = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )
  const [falloImagen, setFalloImagen] = useState(false)
  const puedeAgregar = producto.disponible && cantidad < producto.stock
  return (
    <Card className="product">
      {producto.imagen_url && !falloImagen ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          onError={() => setFalloImagen(true)}
          loading="lazy"
        />
      ) : (
        <div className="image-placeholder">{producto.categoria.nombre}</div>
      )}
      <div className="product-body">
        <small>{producto.categoria.nombre}</small>
        <h2>{producto.nombre}</h2>
        <p>{producto.descripcion}</p>
        <strong>{dinero(producto.precio_base)}</strong>
        <p className="muted">
          {!producto.disponible
            ? 'No disponible'
            : producto.stock === 0
              ? 'Sin stock'
              : 'Stock: ' + producto.stock}
        </p>
        <Button
          disabled={!puedeAgregar}
          onClick={() => {
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
            })
            avisarExito(producto.nombre + ': agregado al carrito.')
          }}
        >
          {cantidad > 0 ? 'Agregar otro (' + cantidad + ' en carrito)' : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}
