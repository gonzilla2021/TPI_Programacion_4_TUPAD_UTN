from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido, DetallePedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session):
        super().__init__(session, Pedido)

    def get_for_update(self, pedido_id):
        return self.session.exec(
            select(Pedido).where(Pedido.id == pedido_id).with_for_update()
        ).first()

    def add_item(self, item: DetallePedido):
        self.session.add(item)
        self.session.flush()

    def list_by_usuario(self, usuario_id, skip, limit, estado):
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado:
            filtros.append(Pedido.estado == estado)
        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*filtros)
        ).one()
        consulta = select(Pedido).where(*filtros).options(selectinload(Pedido.items))
        return (
            total,
            self.session.exec(
                consulta.order_by(Pedido.id.desc()).offset(skip).limit(limit)
            ).all(),
        )

    def count_by_estado(self, estado):
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        ).one()

    def count_hoy(self):
        inicio = (
            datetime.combine(date.today(), time.min)
            .astimezone()
            .astimezone(timezone.utc)
        )
        return self.session.exec(
            select(func.count())
            .select_from(Pedido)
            .where(
                Pedido.created_at >= inicio,
                Pedido.created_at < inicio + timedelta(days=1),
            )
        ).one()

    def ingresos_entregados(self):
        return self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(
                Pedido.estado == "ENTREGADO"
            )
        ).one()
