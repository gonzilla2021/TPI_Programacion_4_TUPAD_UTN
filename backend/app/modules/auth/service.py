from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def registrar(self, datos: UserCreate):
        try:
            with UsuarioUnitOfWork() as uow:
                if uow.usuarios.get_by_username(
                    datos.username
                ) or uow.usuarios.get_by_email(str(datos.email)):
                    raise HTTPException(409, "El usuario o email ya existe")
                user = Usuario(
                    username=datos.username,
                    full_name=datos.full_name,
                    email=str(datos.email),
                    hashed_password=hash_password(datos.password),
                    role="user",
                )
                uow.usuarios.add(user)
                return UserPublic.model_validate(user)
        except IntegrityError:
            raise HTTPException(409, "El usuario o email ya existe")

    def login(self, username: str, password: str) -> str:
        with UsuarioUnitOfWork() as uow:
            user = uow.usuarios.get_by_username(username)
            if user is None or not verify_password(password, user.hashed_password):
                raise HTTPException(401, "Credenciales incorrectas")
            if user.disabled:
                raise HTTPException(400, "Cuenta de usuario desactivada")
            return create_access_token(user.username)
