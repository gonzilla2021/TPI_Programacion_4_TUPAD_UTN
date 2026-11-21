from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    # Los estados terminales no permiten avanzar ni volver a cancelar.
    TRANSICIONES = {  # noqa: RUF012
        "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
        "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
        "ENTREGADO": set(),
        "CANCELADO": set(),
    }

    def __init__(self):
        self.uow = PedidoUnitOfWork()

    def _pedido(self, uow, pedido_id):
        pedido = uow.pedidos.get_for_update(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    def _permiso(self, pedido, usuario):
        if usuario.role != "admin" and pedido.usuario_id != usuario.id:
            raise PedidoAjeno("El pedido pertenece a otro usuario")

    def crear(self, datos, usuario):
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede repetirse en el pedido")
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas,
                )
            )
            total = 0.0
            # Orden estable de bloqueo para evitar descuentos simultáneos incoherentes.
            for item in sorted(datos.items, key=lambda item: item.producto_id):
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado("Producto no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"{producto.nombre} no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente de {producto.nombre}")
                producto.stock -= item.cantidad
                subtotal = producto.precio_base * item.cantidad
                # Copia histórica: el catálogo no modifica las líneas del pedido.
                uow.pedidos.add_item(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = total
            uow.session.flush()
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario, skip, limit, estado):
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                None if usuario.role == "admin" else usuario.id, skip, limit, estado
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id, usuario):
        with self.uow as uow:
            pedido = self._pedido(uow, pedido_id)
            self._permiso(pedido, usuario)
            return PedidoRead.model_validate(pedido)

    def _transicion(self, uow, pedido, estado):
        if estado not in self.TRANSICIONES[pedido.estado]:
            raise TransicionInvalida("Transición de estado inválida")
        if estado == "CANCELADO":
            # La transición ya validada evita restituir el stock más de una vez.
            for item in sorted(pedido.items, key=lambda item: item.producto_id):
                producto = uow.productos.get_for_update(item.producto_id)
                producto.stock += item.cantidad
        pedido.estado = estado
        pedido.updated_at = datetime.now(timezone.utc)
        uow.session.flush()
        return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id, estado):
        with self.uow as uow:
            return self._transicion(uow, self._pedido(uow, pedido_id), estado)

    def cancelar(self, pedido_id, usuario):
        with self.uow as uow:
            pedido = self._pedido(uow, pedido_id)
            self._permiso(pedido, usuario)
            if usuario.role != "admin" and pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo podés cancelar pedidos pendientes")
            return self._transicion(uow, pedido, "CANCELADO")

    def resumen(self):
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=float(uow.pedidos.ingresos_entregados()),
            )
