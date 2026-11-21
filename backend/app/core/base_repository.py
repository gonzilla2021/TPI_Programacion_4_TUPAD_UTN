from typing import Generic, TypeVar

from sqlmodel import SQLModel, Session, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones comunes de persistencia; el commit queda a cargo del UoW."""

    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model).order_by(self.model.id)).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        # flush asigna el ID sin confirmar: el UoW puede deshacer el INSERT.
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
