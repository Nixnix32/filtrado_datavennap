import pandas as pd
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.ubicacion import Ubicacion
from app.models.consulta import Consulta
from app.models.telefono import Telefono

def importar_excel(file_path: str, db: Session):
    df = pd.read_excel(file_path, dtype=str)
    df.columns = df.columns.str.strip().str.upper()
    df = df.fillna("")

    registros_creados = 0
    batch_size = 1000 

    try:
        for i, (_, row) in enumerate(df.iterrows(), 1):
            # 1. GESTIONAR USUARIO
            cedula_clean = row["CEDULA"].strip()
            if not cedula_clean: continue

            usuario = db.query(Usuario).filter_by(cedula=cedula_clean).first()
            if not usuario:
                usuario = Usuario(cedula=cedula_clean, nombre=row["DENUNCIANTE"].strip())
                db.add(usuario)
                db.flush()

            # 2. GESTIONAR TELÉFONO (Herramienta Many-to-Many)
            numero_clean = row.get("TELEFONO", "").strip()
            if numero_clean:
                # Buscamos si el teléfono existe
                telefono = db.query(Telefono).filter_by(telefono=numero_clean).first()
                if not telefono:
                    telefono = Telefono(telefono=numero_clean)
                    db.add(telefono)
                    db.flush()
                
                # Vinculamos al usuario si no está vinculado ya (evita duplicados en la puente)
                if telefono not in usuario.telefonos:
                    usuario.telefonos.append(telefono)
                    db.flush()

            # 3. GESTIONAR UBICACIÓN
            ubicacion = db.query(Ubicacion).filter_by(
                estado=row["ESTADO"].strip(),
                municipio=row["MUNICIPIO"].strip(),
                parroquia=row["PARROQ"].strip()
            ).first()
            
            if not ubicacion:
                ubicacion = Ubicacion(
                    estado=row["ESTADO"].strip(),
                    municipio=row["MUNICIPIO"].strip(),
                    parroquia=row["PARROQ"].strip()
                )
                db.add(ubicacion)
                db.flush()

            # 4. GESTIONAR CONSULTA
            codigo_clean = row["CODIGO"].strip()
            existe_consulta = db.query(Consulta).filter_by(codigo=codigo_clean).first()
            
            if not existe_consulta and codigo_clean:
                nueva_consulta = Consulta(
                    codigo=codigo_clean,
                    asunto=row["ASUNTO"].strip(),
                    descripcion=row["DESCRIP"].strip(),
                    fechaCreada=row.get("FECHA CREACION", "2026-01-23"),
                    idusuario=usuario.idusuario,
                    idubicacion=ubicacion.idubicacion
                )
                db.add(nueva_consulta)
                registros_creados += 1

            # BATCH COMMIT
            if i % batch_size == 0:
                db.commit()

        db.commit()
        return registros_creados

    except Exception as e:
        db.rollback()
        raise e