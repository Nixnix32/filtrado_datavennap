# Librerias necesarias para la conexion con la base de datos (POSTGRES).
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Permitir la lectura del archivo .env.
load_dotenv()

# Extraer la cadena de conexion
database_url = os.getenv("DATABASE_URL")

# ENGINE se encarga de hablar con el archivo o servidor de la base de datos.
engine = create_engine(database_url, echo=True) # echo=true Muestra en la consola todas las consultas SQL que SQLAlchemy está generando.

# Al trabajar con FastAPI, sessionmaker permite la apertura y cierre de sessiones. Actua como zona temporal o borrador. Funciones basicas: 'db.add(usuario)', 'db.commit()', 'db.rollback()'.
# Vincula engine con sessionmaker.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Definicion de la clase padre donde se heredan los modelos de otros archivos.
class Base(DeclarativeBase):
    pass

# Dependecia de get_db
def get_db():
    db = SessionLocal() # Se crea una conexion nueva.
    try:
        yield db # Se entrega la conexion al endpoint que la pidio.
    finally:
        db.close() # Se cierra la conexion.