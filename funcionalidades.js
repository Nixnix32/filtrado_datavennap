// --- 1. VARIABLES GLOBALES ---
let cambiosPendientes = 0;
let paginaActual = 1;
const filasPorPagina = 10;
let datosTotales = []; 
let datosFiltrados = []; 

const inputExcel = document.getElementById('inputExcel');
const nombreArchivo = document.getElementById('nombreArchivo');
const btnSeleccionar = document.getElementById('btnSeleccionar');
const inputBusqueda = document.getElementById('inputBusqueda');

// Configuración inicial del botón de selección
if (btnSeleccionar) btnSeleccionar.onclick = () => inputExcel.click();

if (inputExcel) {
    inputExcel.onchange = function() {
        if (this.files[0]) {
            nombreArchivo.innerText = this.files[0].name;
            // Limpiamos estilos de estados anteriores al elegir un nuevo archivo
            nombreArchivo.classList.remove('texto-exito', 'texto-error');
        } else {
            nombreArchivo.innerText = "Ningún archivo seleccionado";
        }
    };
}

// --- 2. FUNCIÓN PARA ENVÍO DE DATOS ---
async function enviandodatos() {
    const fileInput = document.getElementById('inputExcel');
    const archivo = fileInput.files[0];

    if (!archivo) {
        Swal.fire('Atención', 'Por favor, selecciona un archivo Excel primero.', 'warning');
        return;
    }

    // Mostrar loader antes de iniciar
    document.getElementById("loader").style.display = "block";
    
    const formData = new FormData();
    formData.append('file', archivo);

    try {
        const response = await fetch('http://192.168.0.198:8000/usuarios/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Error al procesar el archivo en el servidor");

        const resultado = await response.json();

        // ✅ ÉXITO: Feedback visual verde
        nombreArchivo.innerText = "¡Archivo subido correctamente!";
        nombreArchivo.classList.remove('texto-error');
        nombreArchivo.classList.add('texto-exito');

        Swal.fire({
            title: '¡Carga Exitosa!',
            icon: 'success',
            confirmButtonText: 'Ver Datos'
        }).then((result) => {
            if (result.isConfirmed) cargarUsuariosDesdeBackend();
        });

    } catch (error) {
        console.error("Error en la carga:", error);
        
        // ❌ ERROR: Feedback visual rojo
        nombreArchivo.innerText = "Error al subir el archivo";
        nombreArchivo.classList.remove('texto-exito');
        nombreArchivo.classList.add('texto-error');
        
        Swal.fire('Error', 'No se pudo subir el archivo. Revisa la conexión.', 'error');

    } finally {
        // 🛑 Ocultar loader SIEMPRE al terminar
        document.getElementById("loader").style.display = "none";
        // Opcional: limpiar input para permitir re-selección
        fileInput.value = ""; 
    }
}

// --- 3. CARGA Y RENDERIZADO (Se mantiene tu lógica funcional) ---

async function cargarUsuariosDesdeBackend() {
    document.getElementById("loader").style.display = "block";
    try {
        const response = await fetch('http://192.168.0.198:8000/usuarios/', { method: 'GET' });
        if (!response.ok) throw new Error("Error en el servidor");
        
        const datosRecibidos = await response.json();
        
        datosTotales = datosRecibidos.map((dato, index) => ({
            id_unico: dato.id || index,
            codigo: dato.codigo || `REF-${index}`,
            cedula: dato.cedula || "00000000",
            nombre: dato.nombre || "Sin Nombre",
            telefono: dato.telefono || "N/A",
            estado: dato.estado || "N/A",
            municipio: dato.municipio || "N/A",
            categoria: dato.categoria || "General",
            subcategoria: dato.subcategoria || "General",
            estatus: dato.estatus || "EN PROCESO",
            aprobacion: dato.aprobacion || "POR APROBAR",
            estatusClass: (dato.estatus === "PROCESADA") ? "bg-primary text-white" : "bg-warning text-dark",
            aprobClass: (dato.aprobacion === "APROBADA") ? "bg-success text-white" : "bg-secondary text-white"
        }));

        generarOpcionesFiltros(); 
        finalizarCarga();
    } catch (error) {
        console.error("Error conexión:", error);
        Swal.fire('Error de Conexión', 'No se pudo conectar con el servidor.', 'error');
        document.getElementById("loader").style.display = "none";
    }
}

function finalizarCarga() {
    datosFiltrados = [...datosTotales];
    paginaActual = 1;
    document.getElementById("loader").style.display = "none";
    document.getElementById("dataWindow").classList.remove("d-none");
    renderizarTabla();
}

// (Aquí continuarían tus funciones de renderizarTabla, filtros y buscador que ya tienes bien configuradas)