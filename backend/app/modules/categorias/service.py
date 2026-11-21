from sqlalchemy.exc import IntegrityError
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaRead
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self):
        self.uow = CategoriaUnitOfWork()

    def _activa(self, uow, categoria_id):
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria

    def listar(self):
        with self.uow as uow:
            return [
                CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()
            ]

    def obtener(self, categoria_id):
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, datos):
        try:
            with self.uow as uow:
                if uow.categorias.get_by_nombre(datos.nombre):
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria = uow.categorias.add(Categoria(**datos.model_dump()))
                return CategoriaRead.model_validate(categoria)
        except IntegrityError:
            raise NombreDuplicado("Ya existe una categoría con ese nombre")

    def actualizar(self, categoria_id, datos):
        try:
            with self.uow as uow:
                categoria = self._activa(uow, categoria_id)
                cambios = datos.model_dump(exclude_unset=True)
                if "nombre" in cambios:
                    existente = uow.categorias.get_by_nombre(cambios["nombre"])
                    if existente and existente.id != categoria_id:
                        raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria.sqlmodel_update(cambios)
                uow.session.flush()
                return CategoriaRead.model_validate(categoria)
        except IntegrityError:
            raise NombreDuplicado("Ya existe una categoría con ese nombre")

    def eliminar(self, categoria_id):
        with self.uow as uow:
            # Dar de baja la categoría no oculta sus productos ni libera su nombre.
            self._activa(uow, categoria_id).activo = False
