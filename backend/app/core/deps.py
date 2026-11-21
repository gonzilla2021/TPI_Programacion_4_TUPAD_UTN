from fastapi import Depends, HTTPException, Request
from jose import JWTError

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import UserPublic


def get_current_user(request: Request) -> UserPublic:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "Sesión no válida")
    try:
        username = decode_access_token(token).get("sub")
        if not isinstance(username, str):
            raise HTTPException(401, "Sesión no válida")
    except JWTError:
        raise HTTPException(401, "Sesión no válida")
    with session_factory() as session:
        user = UsuarioRepository(session).get_by_username(username)
        if user is None:
            raise HTTPException(401, "Sesión no válida")
        return UserPublic.model_validate(user)


def get_current_active_user(user: UserPublic = Depends(get_current_user)):
    if user.disabled:
        raise HTTPException(400, "Cuenta de usuario desactivada")
    return user


def require_role(roles: list[str]):
    def check_role(user: UserPublic = Depends(get_current_active_user)):
        if user.role not in roles:
            raise HTTPException(403, "No tenés permiso para esta operación")
        return user

    return check_role
