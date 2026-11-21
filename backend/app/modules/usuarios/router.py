from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios"])


def get_usuario_service():
    return UsuarioService()


@router.get("", response_model=list[UserPublic])
def listar(
    admin: UserPublic = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar(
    usuario_id: int,
    admin: UserPublic = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.cambiar_actividad(usuario_id, False, admin.id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar(
    usuario_id: int,
    admin: UserPublic = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.cambiar_actividad(usuario_id, True, admin.id)
