from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session):
        super().__init__(session, Producto)

    def get_for_update(self, producto_id):
        # PostgreSQL bloquea la fila hasta que termina la transacción del pedido.
        return self.session.exec(
            select(Producto).where(Producto.id == producto_id).with_for_update()
        ).first()

    def search(self, skip, limit, search, categoria_id, disponible):
        filtros = [Producto.activo == True]
        if search:
            filtros.append(Producto.nombre.ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)
        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*filtros)
        ).one()
        consulta = (
            select(Producto).where(*filtros).options(selectinload(Producto.categoria))
        )
        items = self.session.exec(
            consulta.order_by(Producto.id).offset(skip).limit(limit)
        ).all()
        return total, items
