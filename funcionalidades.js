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

    document.getElementById("loader").style.display = "block";
    const formData = new FormData();
    formData.append('file', archivo);

    try {
        const response = await fetch('http://192.168.0.184:8000/importar', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Error al procesar el archivo");

        nombreArchivo.innerText = "¡Archivo subido correctamente!";
        nombreArchivo.classList.add('texto-exito');

        Swal.fire({
            title: '¡Carga Exitosa!',
            text: 'El archivo se subió. Presiona "Mostrar" cuando quieras ver los datos.',
            icon: 'success',
            confirmButtonText: 'ok'
        }); 

    } catch (error) {
        console.error("Error en la carga:", error);
        nombreArchivo.classList.add('texto-error');
        Swal.fire('Error', 'No se pudo subir el archivo al servidor.', 'error');
    } finally {
        document.getElementById("loader").style.display = "none";
        fileInput.value = ""; 
    }
}

// --- 3. CARGA Y RENDERIZADO DINÁMICO ---

async function cargarUsuariosDesdeBackend() {
    document.getElementById("loader").style.display = "block";
    try {
        const response = await fetch('http://192.168.0.184:8000/vista/?skip=0&limit=10', { 
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error("Error en el servidor");
        
        const datosRecibidos = await response.json();
        
        // CORRECCIÓN AQUÍ: Accedemos a la propiedad .data que vimos en tu Swagger
        if (datosRecibidos && datosRecibidos.data) {
            datosTotales = datosRecibidos.data; 
            datosFiltrados = [...datosTotales];
            finalizarCarga();
        } else {
            throw new Error("El formato de respuesta no contiene la propiedad 'data'");
        }

    } catch (error) {
        console.error("Error:", error);
        Swal.fire('Error', 'No se pudieron obtener los datos de la propiedad .data', 'error');
        document.getElementById("loader").style.display = "none";
    }
}

// ESTA FUNCIÓN ES VITAL: Une la carga con la vista
function finalizarCarga() {
    paginaActual = 1;
    document.getElementById("loader").style.display = "none";
    
    const dataWindow = document.getElementById("dataWindow");
    if (dataWindow) dataWindow.classList.remove("d-none");
    
    renderizarTabla(); // Aquí es donde se dibuja la tabla la primera vez
}

function renderizarTabla() {
    const cuerpo = document.getElementById("cuerpoTabla");
    const cabecera = document.getElementById("cabeceraTabla");
    
    if (!cuerpo || !cabecera || !datosFiltrados || datosFiltrados.length === 0) {
        if(cuerpo) cuerpo.innerHTML = `<tr><td class="text-center">No hay datos para mostrar</td></tr>`;
        return;
    }

    // 1. Obtener columnas del primer registro de la propiedad "data"
    const columnas = Object.keys(datosFiltrados[0]);

    // 2. Dibujar cabecera
    cabecera.innerHTML = columnas
        .map(col => `<th>${col.toUpperCase().replace(/_/g, ' ')}</th>`)
        .join('');

    // 3. Dibujar filas
    cuerpo.innerHTML = "";
    const inicio = (paginaActual - 1) * filasPorPagina;
    const filasParaMostrar = datosFiltrados.slice(inicio, inicio + filasPorPagina);

    filasParaMostrar.forEach(fila => {
        const tr = document.createElement("tr");
        tr.innerHTML = columnas.map(col => `<td>${fila[col] ?? '—'}</td>`).join('');
        cuerpo.appendChild(tr);
    });

    actualizarControlesPagina(); // Esta función activa/desactiva los botones
}


function actualizarControlesPagina() {
    const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
    const txtConteo = document.getElementById("txtConteoPagina");
    
    if (txtConteo) {
        txtConteo.innerText = `Página ${paginaActual} de ${totalPaginas || 1} (${datosFiltrados.length} registros)`;
    }

    const btnAnt = document.getElementById("btnAnterior");
    const btnSig = document.getElementById("btnSiguiente");

    if (btnAnt) btnAnt.disabled = (paginaActual === 1);
    if (btnSig) btnSig.disabled = (paginaActual >= totalPaginas || totalPaginas === 0);
}

function paginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        renderizarTabla();
    }
}

function paginaSiguiente() {
    const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
    if (paginaActual < totalPaginas) {
        paginaActual++;
        renderizarTabla();
    }
}

// --- 4. BUSCADOR DINÁMICO (MODULAR) ---
if (inputBusqueda) {
    inputBusqueda.addEventListener('input', function(e) {
        const termino = e.target.value.toLowerCase();
        
        datosFiltrados = datosTotales.filter(fila => {
            // Busca el término en CUALQUIER columna del registro
            return Object.values(fila).some(valor => 
                String(valor).toLowerCase().includes(termino)
            );
        });
        
        paginaActual = 1;
        renderizarTabla();
    });
}

// --- 5. PAGINACIÓN ---
function actualizarControlesPagina() {
    const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
    const txtConteo = document.getElementById("txtConteoPagina");
    
    if (txtConteo) {
        txtConteo.innerText = `Página ${paginaActual} de ${totalPaginas || 1} (${datosFiltrados.length} registros)`;
    }

    document.getElementById("btnAnterior").disabled = (paginaActual === 1);
    document.getElementById("btnSiguiente").disabled = (paginaActual >= totalPaginas || totalPaginas === 0);
}

function paginaAnterior() {
    if (paginaActual > 1) { paginaActual--; renderizarTabla(); }
}

function paginaSiguiente() {
    const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
    if (paginaActual < totalPaginas) { paginaActual++; renderizarTabla(); }
}

async function eliminarTodo() {
    // 1. Mostrar la modal de "Procesando..." con SweetAlert2
    Swal.fire({
        title: 'Eliminando base de datos',
        text: 'Por favor, espera un momento...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading(); // Esto activa el spinner de carga
        }
    });

    try {
        // 2. Realizar la petición DELETE al servidor 
        const response = await fetch('http://192.168.0.184:8000/limpiar', {
            method: 'DELETE',
            headers: { 'accept': 'application/json' }
        });

        if (!response.ok) throw new Error("Error al borrar los datos");

        // 3. Si todo sale bien, limpiamos nuestra tabla en el frontend 🧹
        datosTotales = [];
        datosFiltrados = [];
        renderizarTabla();

        // 4. Cambiamos la modal de carga por una de éxito ✅
        Swal.fire('¡Logrado!', 'La base de datos ha sido limpiada.', 'success');

    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo limpiar la base de datos.', 'error');
    }
}