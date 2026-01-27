# Librerias para la creacion de endpoins.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Librerias creadas para conectar la base de datos e importar el excel.
from app.database import SessionLocal

# Importar los routers
from app.routers import vista_consultas
from app.routers import importar_consultas
from app.routers import vaciar_consultas

# Instancia
app = FastAPI(title="SIVNAP API")

# 1. Definir los orígenes permitidos
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*" # ¡Atención! El "*" permite que CUALQUIER dispositivo se conecte. 
        # Úsalo para pruebas iniciales y luego cámbialo por la IP de ella por seguridad.
]

# 2. Configurar el middleware en la aplicación
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Lista de IPs permitidas
    allow_credentials=True,
    allow_methods=["*"],              # Permite GET, POST, DELETE, etc.
    allow_headers=["*"],              # Permite todos los encabezados
)

# EndPoint raiz
@app.get("/")
def root():
    return {"message": "SIVNAP API funcionando"}

# EndPoint para mostrar los datos del excel en el Frontend.
app.include_router(vista_consultas.router)

# EndPoint para importar archivos de excel en la base de datos
app.include_router(importar_consultas.router)

# EndPoint para vaciar las tablas de base de datos.
app.include_router(vaciar_consultas.router)