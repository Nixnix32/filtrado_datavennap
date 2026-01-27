from .usuario import Usuario
from .consulta import Consulta
from .ubicacion import Ubicacion
from .telefono import Telefono
from .asociaciones import puente_usuario_telefono

# Esto expone todas las clases al motor de SQLAlchemy
__all__ = ["Usuario", "Consulta", "Ubicacion", "Telefono", "puente_usuario_telefono"]