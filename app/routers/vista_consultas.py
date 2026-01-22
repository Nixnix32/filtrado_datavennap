# Librerias para habilitar el Router de FastAPI y conectar a la Base de Datos.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Herramientas
from app.database import get_db
from app.models.usuario import Usuario

router = APIRouter(
    prefix="/vista",
    tags=["Vista consultas"]
)

@router.get("/vista-data")
def obtener_consultas(skip: int=0, limit: int=10, db: Session = Depends(get_db)):
    query = db.query(Usuario.cedula, Usuario.nombre).offset(skip).limit(limit).all()

    # Transformamos las tuplas en diccionarios para que el JSON sea claro
    data_formateada = [{"cedula": u.cedula, "nombre": u.nombre} for u in query]
    
    return {
        "total_en_esta_pagina": len(data_formateada),
        "data": data_formateada
    }