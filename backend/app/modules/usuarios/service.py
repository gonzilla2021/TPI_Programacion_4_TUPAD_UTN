from fastapi import HTTPException

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self):
        self.uow = UsuarioUnitOfWork()

    def listar(self):
        with self.uow as uow:
            return [UserPublic.model_validate(user) for user in uow.usuarios.get_all()]

    def cambiar_actividad(self, usuario_id: int, disabled: bool, actor_id: int):
        if disabled and usuario_id == actor_id:
            raise HTTPException(400, "No podés desactivarte a vos mismo")
        with self.uow as uow:
            user = uow.usuarios.get_by_id(usuario_id)
            if user is None:
                raise HTTPException(404, "Usuario no encontrado")
            user.disabled = disabled
            uow.session.flush()
            return UserPublic.model_validate(user)
