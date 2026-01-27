# Falsos positivos
from typing import TYPE_CHECKING
# Esto solo lo lee tu editor de código, Python lo ignora al correr
if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.ubicacion import Ubicacion

from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

#from app.models.usuario import Usuario
#from app.models.ubicacion import Ubicacion

class Consulta(Base):
    __tablename__ = "consultas"
    idconsulta: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    asunto: Mapped[str] = mapped_column(String(500), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    fechaCreada: Mapped[str] = mapped_column(String(20), nullable=True)
    estatus: Mapped[str] = mapped_column(String(20), default="Pendiente")

    # 1. Claves Foráneas (Restricción física en DB)
    idusuario: Mapped[int] = mapped_column(ForeignKey("usuarios.idusuario"))
    idubicacion: Mapped[int] = mapped_column(ForeignKey("ubicaciones.idubicacion"))

    # 2. Relaciones (Herramientas para navegar entre objetos en Python)
    consultasusuarios: Mapped["Usuario"] = relationship(back_populates="consultas")
    consultasubicaciones: Mapped["Ubicacion"] = relationship(back_populates="consultas")
