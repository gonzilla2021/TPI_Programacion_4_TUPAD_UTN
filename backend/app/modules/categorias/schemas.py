from sqlmodel import SQLModel, Field


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaUpdate(SQLModel):
    # Se permite omitir un campo en PUT; nombre no acepta null explícito.
    nombre: str = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
