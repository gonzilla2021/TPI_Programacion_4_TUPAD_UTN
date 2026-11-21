from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings

connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)


def session_factory():
    return Session(engine)


def create_all_tables():
    # Registrar las cinco tablas antes de crear el esquema.
    from app.modules.usuarios.models import Usuario
    from app.modules.categorias.models import Categoria
    from app.modules.productos.models import Producto
    from app.modules.pedidos.models import Pedido, DetallePedido

    SQLModel.metadata.create_all(engine)
