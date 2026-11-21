from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto


def seed():
    create_all_tables()
    # Solo se agregan datos faltantes: no se reinician contraseñas ni stock.
    with session_factory() as session:
        if (
            session.exec(select(Usuario).where(Usuario.username == "admin")).first()
            is None
        ):
            session.add(
                Usuario(
                    username="admin",
                    full_name="Administrador",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                )
            )
        categorias = {}
        for nombre in ("Pizzas", "Hamburguesas", "Bebidas"):
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=nombre)
                session.add(categoria)
                session.flush()
            categorias[nombre] = categoria.id
        productos = [
            ("Pizza muzzarella", "Pizzas", 8500, "Salsa de tomate y muzzarella"),
            ("Pizza especial", "Pizzas", 10000, "Jamón, morrón y muzzarella"),
            ("Pizza napolitana", "Pizzas", 9500, "Tomate y ajo"),
            ("Hamburguesa clásica", "Hamburguesas", 6500, "Carne, lechuga y tomate"),
            ("Hamburguesa con queso", "Hamburguesas", 7000, "Carne y queso"),
            ("Hamburguesa doble", "Hamburguesas", 9000, "Doble carne y queso"),
            ("Agua mineral", "Bebidas", 1800, "Botella de 500 ml"),
            ("Gaseosa", "Bebidas", 2500, "Botella de 500 ml"),
        ]
        for nombre, categoria, precio, descripcion in productos:
            if (
                session.exec(select(Producto).where(Producto.nombre == nombre)).first()
                is None
            ):
                session.add(
                    Producto(
                        nombre=nombre,
                        categoria_id=categorias[categoria],
                        precio_base=precio,
                        descripcion=descripcion,
                        stock=20,
                        imagen_url=(
                            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"
                            if categoria == "Pizzas"
                            else (
                                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
                                if categoria == "Hamburguesas"
                                else "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600"
                            )
                        ),
                    )
                )
        session.commit()
    print("Seed completado: admin, 3 categorías y 8 productos (sin duplicar).")


if __name__ == "__main__":
    seed()
