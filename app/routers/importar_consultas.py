import os
import shutil
# Librerias para habilitar el Router de FastAPI y conectar a la Base de Datos.
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

# Herramientas
from app.database import get_db
from app.services.excel_service import importar_excel

router = APIRouter(
    prefix="/importar",
    tags=["Importar consultas"]
)

@router.post("/cargar-excel")
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