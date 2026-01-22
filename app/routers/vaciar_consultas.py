# Librerias para habilitar el Router de FastAPI y conectar a la Base de Datos.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

# Herramientas
from app.database import Base, get_db

router = APIRouter(
    prefix="/vaciar",
    tags=["Vaciar consultas"]
)

@router.delete("/vaciar-data")
async def truncate_tables(db: Session = Depends(get_db)):
    try:
        # Buscar todos los nombres de las tablas de la base de datos.
        nombres_tablas = [t.name for t in Base.metadata.sorted_tables]

        # Se covierte la lista en un texto.
        lista_tablas = ", ".join(nombres_tablas)

        # Se ejecuta TRUNCATE con CASCADE y RESTART IDENTITY
        # TRUNCATE: Elimina el contenido a alta velocidad.
        # CASCADE: Borra en cascada si hay llaves foraneas
        # RESTART IDENTITY: Restablece los IDs a 1
        query = text(f"TRUNCATE TABLE {lista_tablas} RESTART IDENTITY CASCADE;")

        db.execute(query)
        db.commit()
        return {
            "mensaje": f"Se vaciaron las tablas {lista_tablas}",
            "estado": "Tablas listas para nueva importacion"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al vaciar {str(e)}")