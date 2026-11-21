from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import Mensaje
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UserPublic, status_code=201)
def registrar(datos: UserCreate):
    return AuthService().registrar(datos)


@router.post("/token", response_model=Mensaje)
def login(response: Response, form: OAuth2PasswordRequestForm = Depends()):
    token = AuthService().login(form.username, form.password)
    # El navegador envía la cookie; JavaScript no puede leer el JWT.
    response.set_cookie(
        "access_token",
        token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.FRONTEND_ORIGIN.startswith("https://"),
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def perfil(user: UserPublic = Depends(get_current_active_user)):
    return user
