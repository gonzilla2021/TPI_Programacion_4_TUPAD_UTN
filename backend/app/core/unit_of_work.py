from app.core.database import session_factory


class UnitOfWork:
    """Comparte una sesión y confirma todos los cambios o los revierte juntos."""

    def __init__(self, factory=session_factory):
        self.factory = factory

    def __enter__(self):
        self.session = self.factory()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        # También se revierte si falla el commit; la sesión se cierra en ambos casos.
        try:
            if exc_type is None:
                try:
                    self.session.commit()
                except Exception:
                    self.session.rollback()
                    raise
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False
