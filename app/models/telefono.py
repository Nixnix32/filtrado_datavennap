# Librerias para el Mapeo de una tabla.
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

# Asociacion con tabla telefonos
from sqlalchemy.orm import relationship
from app.models.asociaciones import puente_usuario_telefono

# Se llama la clase Padre.
from app.database import Base

# Clase Telefono
class Telefono(Base):
    __tablename__ = "telefonos"
    idtelefono: Mapped[int] = mapped_column(primary_key=True)
    telefono: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    
    # Conexion muchos a muchos Usuario-Telefono
    usuarios = relationship(
        "Usuario",
        secondary=puente_usuario_telefono,
        back_populates="telefonos"
)