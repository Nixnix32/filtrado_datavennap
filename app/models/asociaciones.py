# Librerias para asociar tablas para la relacion de muchos a muchos.
from sqlalchemy import Table, Column, Integer, ForeignKey
from app.database import Base

# Creacion de una tabla simple.
puente_usuario_telefono = Table(
    "puenteusuariostelefonos",
    Base.metadata,
    Column("idusuario", Integer, ForeignKey("usuarios.idusuario", ondelete="CASCADE"), primary_key=True),
    Column("idtelefono", Integer, ForeignKey("telefonos.idtelefono", ondelete="CASCADE"), primary_key=True)
)