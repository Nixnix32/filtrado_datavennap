# Librerias para el Mapeo de datos de una tabla.
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

# Se llama la clase Padre.
from app.database import Base

# Clase Usuario
class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(primary_key=True)
    cedula: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    