from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
)
from app.modules.productos.service import ProductoService, ProductoNoEncontrado

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service():
    return ProductoService()


def ejecutar(operacion, *args):
    try:
        return operacion(*args)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(404, str(exc))


@router.get("", response_model=ProductosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(get_producto_service),
):
    return ejecutar(service.listar, skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    return ejecutar(service.obtener, producto_id)


@router.post(
    "",
    response_model=ProductoRead,
    status_code=201,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear(
    datos: ProductoCreate, service: ProductoService = Depends(get_producto_service)
):
    return ejecutar(service.crear, datos)


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar(
    producto_id: int,
    datos: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    return ejecutar(service.actualizar, producto_id, datos)


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    return ejecutar(service.actualizar, producto_id, datos)


@router.delete(
    "/{producto_id}", status_code=204, dependencies=[Depends(require_role(["admin"]))]
)
def eliminar(
    producto_id: int, service: ProductoService = Depends(get_producto_service)
):
    ejecutar(service.eliminar, producto_id)
    return Response(status_code=204)
