# Falsos positivos
from typing import TYPE_CHECKING
# Esto solo lo lee tu editor de código, Python lo ignora al correr
if TYPE_CHECKING:
    from app.models.consulta import Consulta

# Librerias para el Mapeo de una tabla.
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

# Asociacion con tabla telefonos
from sqlalchemy.orm import relationship
from app.models.asociaciones import puente_usuario_telefono

# Se llama la clase Padre.
from app.database import Base

#from app.models.consulta import Consulta

# Clase Usuario
class Usuario(Base):
    __tablename__ = "usuarios"
    idusuario: Mapped[int] = mapped_column(primary_key=True)
    cedula: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), index=True, nullable=False)

    consultas: Mapped[list["Consulta"]] = relationship(back_populates="consultasusuarios")
    
    # Conexion muchos a muchos Usuario-Telefono
    telefonos = relationship(
        "Telefono",
        secondary=puente_usuario_telefono,
        back_populates="usuarios"
)