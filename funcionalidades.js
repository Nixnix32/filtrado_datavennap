// --- 1. VARIABLES GLOBALES ---
let paginaActual = 1;
const filasPorPagina = 10;
let datosTotales = []; 
let datosFiltrados = []; 
let archivoCargado = false;

const inputExcel = document.getElementById('inputExcel');
const nombreArchivo = document.getElementById('nombreArchivo');
const btnSeleccionar = document.getElementById('btnSeleccionar');
const inputBusqueda = document.getElementById('inputBusqueda');
const loader = document.getElementById("loader");

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

// --- 2. CARGAR ARCHIVO CON BARRA DE PROGRESO ---
async function subirArchivo() {
    const archivo = inputExcel.files[0];
    const btnCargar = document.getElementById("btnCargar");

    if (!archivo) {
        return Swal.fire('Atención', 'Selecciona un archivo antes de cargar.', 'warning');
    }

    if (archivoCargado) {
        return Swal.fire('Sistema Bloqueado', 'Ya hay datos cargados. Debe "Eliminar Todo" para subir un nuevo archivo.', 'info');
    }

    const contenedor = document.getElementById("contenedorProgreso");
    const barra = document.getElementById("barraProgreso");
    const texto = document.getElementById("textoCarga");
    const formData = new FormData();
    formData.append('file', archivo);
const xhr = new XMLHttpRequest();

xhr.onloadstart = function() {
    contenedor.style.display = "block";
    btnCargar.disabled = true; 
    // Aseguramos el color fijo desde el inicio (ejemplo: azul de Bootstrap o el que prefieras)
    barra.className = "progress-bar"; 
};

xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
        // 1. MODIFICACIÓN: Multiplicamos por 0.9 para que el tope sea 90%
        const porcentaje = Math.round((e.loaded / e.total) * 90);
        barra.style.width = porcentaje + "%";
        
        // 2. MODIFICACIÓN: Cambiamos el texto según el avance
        if (porcentaje < 90) {
            texto.innerText = `Subiendo archivo... ${porcentaje}%`;
        } else {
            texto.innerText = `Procesando en el servidor... espera un momento`;
        }
    }
};

xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
        // 3. MODIFICACIÓN: Al recibir respuesta exitosa, saltamos al 100%
        barra.style.width = "100%";
        texto.innerText = "¡Completado al 100%!";
        barra.classList.replace("bg-primary", "bg-success"); // Opcional: cambiar a verde solo al final

        archivoCargado = true; 
        nombreArchivo.innerText = "¡Archivo subido correctamente!";
        nombreArchivo.classList.add('texto-exito');
        
        btnCargar.style.opacity = "0.5";
        btnCargar.style.cursor = "not-allowed";

        Swal.fire('¡Éxito!', 'Los datos se han cargado y procesado.', 'success');
    } else {
        btnCargar.disabled = false;
        Swal.fire('Error', 'No se pudo subir el archivo.', 'error');
    }
    setTimeout(() => { contenedor.style.display = "none"; }, 1500);
};

xhr.onerror = function() {
    btnCargar.disabled = false;
    contenedor.style.display = "none";
    Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
};

xhr.open('POST', 'http://100.84.45.100:8000/importar/cargar-excel');
xhr.send(formData);
    
}

// --- 3. MOSTRAR DATOS (CORREGIDO Y SIN DUPLICADOS) ---
async function mostrarDatos() {
    // 1. Mostrar loader de HTML
    if (loader) loader.style.display = "block"; 
    
    try {
        const response = await fetch('http://100.84.45.100:8000/vista/vista-data?skip=0&limit=50');
        
        if (!response.ok) throw new Error("Error en servidor");
        
        const res = await response.json();
        const datosCargados = res.data || res;

        if (Array.isArray(datosCargados) && datosCargados.length > 0) {
            datosTotales = datosCargados;
            datosFiltrados = [...datosTotales];
            archivoCargado = true; 
            
            const dataWindow = document.getElementById("dataWindow");
            if (dataWindow) dataWindow.classList.remove("d-none");
            
            paginaActual = 1;
            renderizarTabla();

            // 2. Ocultar loader de HTML antes de la alerta
            if (loader) loader.style.display = "none";

            // 3. Alerta central sin animaciones extra
            Swal.fire({
                title: '¡Datos en el Sistema!',
                text: 'La información se ha cargado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#28a745'
            });

        } else {
            if (loader) loader.style.display = "none";
            Swal.fire('Base de Datos Vacía', 'No hay datos almacenados.', 'info');
        }

    } catch (e) {
        console.error("Error:", e);
        if (loader) loader.style.display = "none";
        Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
    } finally {
        // Garantizamos que el loader se apague siempre
        if (loader) loader.style.display = "none";
    }
}

function renderizarTabla() {
    const cuerpo = document.getElementById("cuerpoTabla");
    const cabecera = document.getElementById("cabeceraTabla");
    
    if (!cuerpo || !cabecera) return;

    if (datosFiltrados.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="100%" class="text-center">No hay datos para mostrar</td></tr>`;
        return;
    }

    // 1. Definimos el orden: Forzamos el ID de primero
    const ordenDeseado = ['id_usuario', 'usuario', 'cedula_separada']; 
    const todasLasColumnas = Object.keys(datosFiltrados[0]);
    const columnasRestantes = todasLasColumnas.filter(col => !ordenDeseado.includes(col));
    const columnasFinales = [...ordenDeseado, ...columnasRestantes];

    // 2. Dibujamos la cabecera
    cabecera.innerHTML = columnasFinales.map(col => {
        if (col === 'id_usuario') return `<th>CÓDIGO</th>`;
        if (col === 'usuario') return `<th>NOMBRE USUARIO</th>`;
        if (col === 'cedula_separada') return `<th>CÉDULA</th>`;
        return `<th>${col.toUpperCase().replace(/_/g, ' ')}</th>`;
    }).join('');

    // 3. Dibujamos las filas
    const inicio = (paginaActual - 1) * filasPorPagina;
    const filasParaMostrar = datosFiltrados.slice(inicio, inicio + filasPorPagina);

    cuerpo.innerHTML = filasParaMostrar.map(fila => {
        const celdas = columnasFinales.map(col => {
            let valor = fila[col];

            // CASO CÓDIGO: Buscamos el ID en cualquier nombre posible
            if (col === 'id_usuario') {
                const codigoReal = fila.id_usuario || fila.id || fila.ID || fila.codigo || '—';
                return `<td class="fw-bold text-secundary r">${codigoReal}</td>`;
            }

            // CASO NOMBRE (objeto usuario)
            if (col === 'usuario' && valor && typeof valor === 'object') {
                return `<td>${valor.nombre || '—'}</td>`;
            }

            // CASO CÉDULA (dentro de objeto usuario)
            if (col === 'cedula_separada') {
                return `<td>${fila.usuario?.cedula || '—'}</td>`;
            }

            // CASO UBICACIÓN (objeto)
            if (col === 'ubicacion' && valor && typeof valor === 'object') {
                return `<td>${valor.estado || ''}</td>`;
            }

            // CUALQUIER OTRA COLUMNA
            return `<td>${valor ?? '—'}</td>`;
        }).join('');
        
        return `<tr>${celdas}</tr>`;
    }).join('');

    actualizarControlesPagina();
}

// --- 5. PAGINACIÓN Y FILTRADO ---
function actualizarControlesPagina() {
    const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
    const txtConteo = document.getElementById("txtConteoPagina");
    const btnAnt = document.getElementById("btnAnterior");
    const btnSig = document.getElementById("btnSiguiente");
    if (txtConteo) txtConteo.innerText = `Página ${paginaActual} de ${totalPaginas || 1} (${datosFiltrados.length} registros)`;
    if (btnAnt) btnAnt.disabled = (paginaActual === 1);
    if (btnSig) btnSig.disabled = (paginaActual >= totalPaginas || totalPaginas === 0);
}

function paginaAnterior() { if (paginaActual > 1) { paginaActual--; renderizarTabla(); } }
function paginaSiguiente() {
    const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
    if (paginaActual < totalPaginas) { paginaActual++; renderizarTabla(); }
}

if (inputBusqueda) {
    inputBusqueda.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        datosFiltrados = datosTotales.filter(fila => {
            return Object.values(fila).some(valor => {
                if (valor === null || valor === undefined) return false;
                if (typeof valor === 'object') return Object.values(valor).some(v => v !== null && String(v).toLowerCase().includes(termino));
                return String(valor).toLowerCase().includes(termino);
            });
        });
        paginaActual = 1; renderizarTabla();
    });
}

// --- 6. ELIMINAR TODO (RESET) ---
async function eliminarTodo() {
    const confirmacion = await Swal.fire({
        title: '¿Limpiar sistema?',
        text: "Se borrarán los datos y se permitirá una nueva carga.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar todo'
    });

    if (!confirmacion.isConfirmed) return;

    try {
        const response = await fetch('http://100.84.45.100:8000/vaciar/vaciar-data', { method: 'DELETE' });
        if (!response.ok) throw new Error("Error al borrar");

        archivoCargado = false;
        datosTotales = [];
        datosFiltrados = [];
        
        const btnCargar = document.getElementById("btnCargar");
        btnCargar.disabled = false;
        btnCargar.style.opacity = "1";
        btnCargar.style.cursor = "pointer";

        inputExcel.value = ""; 
        nombreArchivo.innerText = "Ningún archivo seleccionado";
        nombreArchivo.classList.remove('texto-exito');
        
        const dataWindow = document.getElementById("dataWindow");
        if (dataWindow) dataWindow.classList.add("d-none");

        renderizarTabla();
        Swal.fire('Limpio', 'Ya puedes subir un nuevo archivo.', 'success');
    } catch (error) {
        Swal.fire('Error', 'No se pudo limpiar.', 'error');
    }
}

// Al cargar la página, verificamos si ya hay datos en el servidor
window.onload = async () => {
    try {
        const response = await fetch('http://100.84.45.100:8000/vista/vista-data?skip=0&limit=1');
        const res = await response.json();
        
        // Si el servidor devuelve datos, activamos la posibilidad de "Mostrar"
        if ((res.data && res.data.length > 0) || (Array.isArray(res) && res.length > 0)) {
            archivoCargado = true;
            console.log("Datos detectados en el servidor.");
        }
    } catch (e) {
        console.log("No se detectó data previa o el servidor está apagado.");
    }
};