# Librerias base del sistema para el guardado y eliminacion de archivos masivos en disco.
import shutil
import os
# Librerias para la creacion de endpoins.
from fastapi import FastAPI, UploadFile, File, Depends, Query, HTTPException
from fastapi.responses import JSONResponse
# Librerias para la apertura de sesiones en la base de datos y buena lectura de los mismos mediante FastAPI.
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Annotated
# Librerias creadas para conectar la base de datos e importar el excel.
from app.database import SessionLocal, Base
from app.services.excel_service import importar_excel
# Importar los modelos de tablas.
from app.models.usuario import Usuario

# Instancia
app = FastAPI()

# Dependecia de get_db
def get_db():
    db = SessionLocal() # Se crea una conexion nueva.
    try:
        yield db # Se entrega la conexion al endpoint que la pidio.
    finally:
        db.close() # Se cierra la conexion.

# EndPoint para mostrar los datos del excel en el Frontend.
@app.get("/vista/")
def obtener_reporte(skip: int=0, limit: int=100, db: Session = Depends(get_db)):
    query = db.query(Usuario.cedula, Usuario.nombre).offset(skip).limit(limit).all()
    
    # Transformamos las tuplas en diccionarios para que el JSON sea claro
    data_formateada = [{"cedula": u.cedula, "nombre": u.nombre} for u in query]
    
    return {
        "total_en_esta_pagina": len(data_formateada),
        "data": data_formateada
    }

# EndPoint para importar archivos de excel en la base de datos
@app.post("/importar")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):

    # Recepcion y guardado
    temp_path = "temporal.xlsx"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Procesamiento
    try:
        resultado = importar_excel(temp_path, db)
        return {"mensaje": "Exito", "total": resultado}
    finally: # Limpieza
        if os.path.exists(temp_path):
            os.remove(temp_path)

# EndPoint para vaciar las tablas de base de datos.
@app.delete("/limpiar")
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