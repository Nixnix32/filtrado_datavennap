import pandas as pd
from sqlalchemy.orm import Session
# from sqlalchemy import insert
from sqlalchemy.dialects.postgresql import insert

from app.models.usuario import Usuario

def importar_excel(file_path: str, db: Session):

    # Lectura del archivo usando la ruta proporcionada.
    df = pd.read_excel(file_path, dtype=str)

    # Normaliza los datos, asegurando quitar los espacios y mayusculas en los encabezados.
    df.columns = df.columns.str.strip().str.upper()

    # Valida que existan las columnas especificas.
    columnas_necesarias = ["CEDULA", "DENUNCIANTE"]
    for col in columnas_necesarias:
        if col not in df.columns:
            raise ValueError(f"El Excel no contiene la columna: {col}")
        
    # Limpia los datos masivos.
    # Se eliminan filas con cedula vacia y duplicados.
    df = df.dropna(subset=["CEDULA"])
    df = df.drop_duplicates(subset=["CEDULA"])

    # Mapea el Excel al Modelo de la DB 'cedula' y 'nombre' son los atributos de la clase Usuario
    datos_para_db = [
        {"cedula": row["CEDULA"].strip(), 
         "nombre": row["DENUNCIANTE"].strip()}
         for _, row in df.iterrows()
    ]

    # Insercion Masiva (Alta eficiencia)
    try:
        # db.execute(insert(Usuario), datos_para_db)
        # db.commit()

        stmt = insert(Usuario).values(datos_para_db)
        stmt = stmt.on_conflict_do_nothing(index_elements=["cedula"])

        db.execute(stmt)
        db.commit()

        return len(datos_para_db)
    except Exception as e:
        db.rollback()
        raise e