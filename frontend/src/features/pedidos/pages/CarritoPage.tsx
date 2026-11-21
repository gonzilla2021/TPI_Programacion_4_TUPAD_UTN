import { avisarExito } from '../../../store/noticeStore'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { dinero } from '../../../shared/money'

export function CarritoPage() {
  const { items, quitar, cambiarCantidad, vaciar, total } = useCartStore()
  return (
    <>
      <h1>Tu carrito</h1>
      {items.length === 0 ? (
        <EstadoVacio mensaje="El carrito está vacío. Agregá productos desde el catálogo." />
      ) : (
        <Card>
          {items.map((item) => (
            <div className="cart-row" key={item.producto_id}>
              <div>
                <h2>{item.nombre}</h2>
                <p>{dinero(item.precio_unitario)} por unidad</p>
              </div>
              <label>
                Cantidad
                <input
                  aria-label={'Cantidad de ' + item.nombre}
                  type="number"
                  min={1}
                  step={1}
                  value={item.cantidad}
                  onChange={(e) => cambiarCantidad(item.producto_id, Number(e.target.value))}
                />
              </label>
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{dinero(item.precio_unitario * item.cantidad)}</strong>
                <small>
                  {dinero(item.precio_unitario)} × {item.cantidad}
                </small>
              </div>
              <Button
                className="secondary"
                onClick={() => {
                  quitar(item.producto_id)
                  avisarExito(item.nombre + ': quitado del carrito.')
                }}
              >
                Quitar
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
            <Button
              className="secondary"
              onClick={() => {
                if (window.confirm('¿Querés vaciar el carrito?')) {
                  vaciar()
                  avisarExito('Carrito vaciado.')
                }
              }}
            >
              Vaciar carrito
            </Button>
            <strong>Total: {dinero(total())}</strong>
            <Link className="button" to="/checkout">
              Continuar con el pedido
            </Link>
          </div>
        </Card>
      )}
      <p className="mt-5">
        <Link to="/">Seguir comprando</Link>
      </p>
    </>
  )
}
