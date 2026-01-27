# Falsos positivos
from typing import TYPE_CHECKING
# Esto solo lo lee tu editor de código, Python lo ignora al correr
if TYPE_CHECKING:
    from app.models.consulta import Consulta

# Librerias para el Mapeo de una tabla.
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, UniqueConstraint

from sqlalchemy.orm import relationship

# Se llama la clase Padre.
from app.database import Base

#from app.models.consulta import Consulta

# Clase Ubicacion 
class Ubicacion(Base):
    __tablename__ = "ubicaciones"
    idubicacion: Mapped[int] = mapped_column(primary_key=True)
    estado: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    municipio: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    parroquia: Mapped[str] = mapped_column(String(100), index=True, nullable=False)

    consultas: Mapped[list["Consulta"]] = relationship(back_populates="consultasubicaciones")

    # Unique multiple
    __table_args__ = (
       UniqueConstraint("estado", "municipio", "parroquia", name="uq_estado_municipio_parroquia"), # Tupla
    )
