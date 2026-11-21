from sqlmodel import SQLModel, Field

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    nombre: str
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str = ""
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    nombre: str = None
    descripcion: str | None = None
    precio_base: float = Field(default=None, ge=0)
    imagen_url: str = None
    stock: int = Field(default=None, ge=0)
    disponible: bool = None
    categoria_id: int = None


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(ProductoCreate):
    id: int
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
