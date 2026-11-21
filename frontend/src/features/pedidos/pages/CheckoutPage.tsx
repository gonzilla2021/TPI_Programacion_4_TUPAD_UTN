import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { Formulario } from '../../../shared/components/Formulario'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { useMutacionesPedidos } from '../hooks/usePedidos'
import { dinero } from '../../../shared/money'

export function CheckoutPage() {
  const { items, vaciar, total } = useCartStore()
  const { crear } = useMutacionesPedidos()
  const navigate = useNavigate()
  if (!items.length)
    return <EstadoVacio mensaje="Agregá productos al carrito antes de confirmar." />
  return (
    <section className="card auth">
      <h1>Confirmar pedido</h1>
      <p>
        Total del carrito: <strong>{dinero(total())}</strong>
      </p>
      <p>El precio y el stock se verifican al confirmar.</p>
      <Formulario
        iniciales={{ direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' }}
        campos={[
          {
            nombre: 'direccion_entrega',
            etiqueta: 'Dirección de entrega',
            requerido: true,
            minLength: 5,
            maxLength: 200,
          },
          {
            nombre: 'forma_pago',
            etiqueta: 'Forma de pago',
            tipo: 'select',
            requerido: true,
            opciones: [
              { valor: 'EFECTIVO', texto: 'Efectivo' },
              { valor: 'TRANSFERENCIA', texto: 'Transferencia' },
            ],
          },
          { nombre: 'notas', etiqueta: 'Notas (opcional)', tipo: 'textarea' },
        ]}
        texto="Confirmar pedido"
        enviar={async (datos) => {
          await crear.mutateAsync({
            items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
            direccion_entrega: datos.direccion_entrega,
            forma_pago: datos.forma_pago === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'EFECTIVO',
            notas: datos.notas || null,
          })
          vaciar()
          navigate('/mis-pedidos')
        }}
      />
    </section>
  )
}
