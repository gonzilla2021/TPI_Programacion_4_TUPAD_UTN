from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import ProductoRead, ProductosPaginados
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self):
        self.uow = ProductoUnitOfWork()

    def _activo(self, uow, producto_id):
        producto = uow.productos.get_for_update(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    def _categoria(self, uow, categoria_id):
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")

    def listar(self, skip, limit, search, categoria_id, disponible):
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip, limit, search, categoria_id, disponible
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id):
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, producto_id))

    def crear(self, datos):
        with self.uow as uow:
            self._categoria(uow, datos.categoria_id)
            producto = uow.productos.add(Producto(**datos.model_dump()))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id, datos):
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            cambios = datos.model_dump(exclude_unset=True)
            if (
                "categoria_id" in cambios
                and cambios["categoria_id"] != producto.categoria_id
            ):
                self._categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.session.flush()
            # Si cambia la FK, volver a cargar la relación para la salida.
            uow.session.expire(producto, ["categoria"])
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id):
        with self.uow as uow:
            # La baja lógica conserva el producto referenciado por pedidos anteriores.
            self._activo(uow, producto_id).activo = False
