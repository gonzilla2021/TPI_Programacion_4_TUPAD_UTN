from fastapi import APIRouter, Depends, HTTPException, Response

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.service import (
    CategoriaService,
    CategoriaNoEncontrada,
    NombreDuplicado,
)

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service():
    return CategoriaService()


# La traducción de las excepciones queda en la capa HTTP.
def ejecutar(operacion, *args):
    try:
        return operacion(*args)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(404, str(exc))
    except NombreDuplicado as exc:
        raise HTTPException(409, str(exc))


@router.get("", response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)):
    return ejecutar(service.listar)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(
    categoria_id: int, service: CategoriaService = Depends(get_categoria_service)
):
    return ejecutar(service.obtener, categoria_id)


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=201,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear(
    datos: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)
):
    return ejecutar(service.crear, datos)


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar(
    categoria_id: int,
    datos: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
):
    return ejecutar(service.actualizar, categoria_id, datos)


@router.delete(
    "/{categoria_id}", status_code=204, dependencies=[Depends(require_role(["admin"]))]
)
def eliminar(
    categoria_id: int, service: CategoriaService = Depends(get_categoria_service)
):
    ejecutar(service.eliminar, categoria_id)
    return Response(status_code=204)
