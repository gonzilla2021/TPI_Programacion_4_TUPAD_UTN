from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    CambioEstado,
    EstadoPedido,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoService,
    PedidoNoEncontrado,
    PedidoAjeno,
    StockInsuficiente,
    ProductoNoDisponible,
    ProductoRepetido,
    TransicionInvalida,
)
from app.modules.productos.service import ProductoNoEncontrado

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service():
    return PedidoService()


def ejecutar(operacion, *args):
    try:
        return operacion(*args)
    except (PedidoNoEncontrado, ProductoNoEncontrado) as exc:
        raise HTTPException(404, str(exc))
    except PedidoAjeno as exc:
        raise HTTPException(403, str(exc))
    except (
        StockInsuficiente,
        ProductoNoDisponible,
        ProductoRepetido,
        TransicionInvalida,
    ) as exc:
        raise HTTPException(400, str(exc))


@router.post("", response_model=PedidoRead, status_code=201)
def crear(
    datos: PedidoCreate,
    user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return ejecutar(service.crear, datos, user)


@router.get("", response_model=PedidosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = None,
    user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return ejecutar(service.listar, user, skip, limit, estado)


@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    dependencies=[Depends(require_role(["admin"]))],
)
def resumen(service: PedidoService = Depends(get_pedido_service)):
    return ejecutar(service.resumen)


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener(
    pedido_id: int,
    user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return ejecutar(service.obtener, pedido_id, user)


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def estado(
    pedido_id: int,
    datos: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
):
    return ejecutar(service.cambiar_estado, pedido_id, datos.estado)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar(
    pedido_id: int,
    user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return ejecutar(service.cancelar, pedido_id, user)
