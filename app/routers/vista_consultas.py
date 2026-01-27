# Librerias para habilitar el Router de FastAPI y conectar a la Base de Datos.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Herramientas
from app.database import get_db
from app.models.usuario import Usuario
from app.models.consulta import Consulta

router = APIRouter(
    prefix="/vista",
    tags=["Vista consultas"]
)

from sqlalchemy.orm import joinedload

@router.get("/vista-data")
def obtener_consultas(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    # HERRAMIENTA CLAVE: joinedload carga las relaciones en una sola consulta SQL (JOIN)
    consultas = (
        db.query(Consulta)
        .options(
            joinedload(Consulta.consultasusuarios).joinedload(Usuario.telefonos),
            joinedload(Consulta.consultasubicaciones)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Estructuramos la respuesta para que sea un JSON profesional
    data_formateada = []
    for c in consultas:
        data_formateada.append({
            "codigo": c.codigo,
            "asunto": c.asunto,
            "descripcion": c.descripcion,
            "fecha": c.fechaCreada,
            "estatus": c.estatus,
            "usuario": {
                "cedula": c.consultasusuarios.cedula,
                "nombre": c.consultasusuarios.nombre,
                "telefonos": [t.telefono for t in c.consultasusuarios.telefonos]
            },
            "ubicacion": {
                "estado": c.consultasubicaciones.estado,
                "municipio": c.consultasubicaciones.municipio,
                "parroquia": c.consultasubicaciones.parroquia
            }
        })

    return {
        "total_en_esta_pagina": len(data_formateada),
        "data": data_formateada
    }