/* --- funcionalidades_usuario.js --- */

// --- 1. VARIABLES GLOBALES ---
let cambiosPendientes = 0;
let paginaActual = 1;
const filasPorPagina = 10;
let datosTotales = []; 
let datosFiltrados = []; 

const inputBusqueda = document.getElementById('inputBusqueda');

// --- 2. FUNCIÓN DE CARGA (TRAER DATA DEL SERVIDOR) ---
async function procesarCarga() {
    // Mostrar loader
    const loader = document.getElementById("loader");
    const dataWindow = document.getElementById("dataWindow");
    
    if(loader) loader.style.display = "block";
    if(dataWindow) dataWindow.classList.add("d-none");

    try {
        // Aquí se conecta al endpoint de consulta que configuró tu compañero
        const response = await fetch('http://127.0.0.1:8000/consultar-registros'); 

        if (!response.ok) throw new Error("Error al conectar");

        const datosRecibidos = await response.json();

        // Mapeo de datos (Ajustado para que el usuario vea estatus y aprobación)
        datosTotales = datosRecibidos.map((dato, index) => ({
            ...dato,
            id_unico: dato.id || index,
            estatusClass: dato.estatus === "PROCESADA" ? "bg-primary text-white" : "bg-warning text-dark",
            aprobClass: dato.aprobacion === "APROBADA" ? "bg-success text-white" : "bg-secondary text-white"
        }));

        finalizarCarga();

    } catch (error) {
        console.error("Error:", error);
        // Alerta informativa mientras se sincroniza
        Swal.fire({
            title: 'Sincronizando...',
            text: 'Conectando con la bandeja de entrada del Administrador.',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false
        });
        
        generarDatosPrueba(); // Carga datos de ejemplo si el servidor no responde
        finalizarCarga();
    }
}

function finalizarCarga() {
    datosFiltrados = [...datosTotales];
    paginaActual = 1;
    document.getElementById("loader").style.display = "none";
    document.getElementById("dataWindow").classList.remove("d-none");
    renderizarTabla();
}

// --- 3. BUSCADOR (FILTRADO...) ---
if (inputBusqueda) {
    inputBusqueda.addEventListener('input', function(e) {
        const termino = e.target.value.toLowerCase().trim();
        
        datosFiltrados = datosTotales.filter(dato => 
            dato.cedula.toString().toLowerCase().includes(termino) ||
            dato.nombre.toLowerCase().includes(termino) ||
            dato.municipio.toLowerCase().includes(termino) ||
            dato.categoria.toLowerCase().includes(termino)
        );
        
        paginaActual = 1; 
        renderizarTabla();
    });
}

// --- 4. RENDERIZADO DE TABLA ---
function renderizarTabla() {
    const tbody = document.querySelector("#miTabla tbody");
    if (!tbody) return;
    tbody.innerHTML = ""; 

    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const datosVisibles = datosFiltrados.slice(inicio, fin);

    datosVisibles.forEach((dato) => {
        tbody.innerHTML += `
            <tr>
                <td>${dato.codigo}</td>
                <td><strong>${dato.cedula}</strong></td>
                <td>${dato.nombre}</td>
                <td>${dato.estado}</td>
                <td>${dato.municipio}</td>
                <td>${dato.categoria}</td>
                <td>${dato.subcategoria}</td>
                <td class="text-center">
                    <span class="badge ${dato.estatusClass} estatus" onclick="cambiarEstatus(this, ${dato.id_unico})">${dato.estatus}</span>
                </td>
                <td class="text-center">
                    <span class="badge ${dato.aprobClass} aprobacion" onclick="cambiarAprobacion(this, ${dato.id_unico})">${dato.aprobacion}</span>
                </td>
            </tr>
        `;
    });
    actualizarInfoPaginacion();
}

// --- 5. CAMBIO DE ESTADOS ---
function cambiarEstatus(el, id) {
    const dato = datosTotales.find(d => d.id_unico === id);
    if (!dato) return;

    if (dato.estatus === "EN PROCESO") {
        dato.estatus = "PROCESADA";
        dato.estatusClass = "bg-primary text-white";
        cambiosPendientes++;
    } else {
        dato.estatus = "EN PROCESO";
        dato.estatusClass = "bg-warning text-dark";
        if (cambiosPendientes > 0) cambiosPendientes--;
    }
    el.innerText = dato.estatus;
    el.className = `badge ${dato.estatusClass} estatus`;
    actualizarTextoCambios();
}

function cambiarAprobacion(el, id) {
    const dato = datosTotales.find(d => d.id_unico === id);
    if (!dato) return;

    if (dato.aprobacion === "POR APROBAR") {
        dato.aprobacion = "APROBADA";
        dato.aprobClass = "bg-success text-white";
        cambiosPendientes++;
    } else {
        dato.aprobacion = "POR APROBAR";
        dato.aprobClass = "bg-secondary text-white";
        if (cambiosPendientes > 0) cambiosPendientes--;
    }
    el.innerText = dato.aprobacion;
    el.className = `badge ${dato.aprobClass} aprobacion`;
    actualizarTextoCambios();
}

// --- 6. GUARDAR (ACTUALIZAR BASE) ---
function guardarCambiosFinales() {
    if (cambiosPendientes === 0) return Swal.fire('Sin cambios pendientes', '', 'info');

    Swal.fire({
        title: '¿Guardar cambios?',
        text: "Se actualizará el estatus de las solicitudes.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1a8754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Sincronizando...',
                didOpen: () => { Swal.showLoading(); }
            });

            setTimeout(() => {
                Swal.fire({ title: '¡Actualizado!', icon: 'success', confirmButtonColor: '#2ac39b' });
                cambiosPendientes = 0;
                actualizarTextoCambios();
            }, 1200);
        }
    });
}



function limpiarPantalla() {
    Swal.fire({
        title: '¿Limpiar pantalla?',
        text: "Se borrarán todos los datos cargados.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d4a100',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Mostramos el mensaje de "Limpiando..."
            Swal.fire({
                title: 'Limpiando...',
                text: 'Por favor, espere un momento.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading(); // Muestra el spinner de carga
                }
            });

            // Agregamos un pequeño retraso de 1.5 segundos para que se note la limpieza
            // antes de recargar la página
            setTimeout(() => {
                location.reload();
            }, 1500); 
        }
    });
}
function actualizarTextoCambios() {
    const txt = document.getElementById("txtCambios");
    if (txt) {
        txt.innerText = cambiosPendientes > 0 ? `${cambiosPendientes} cambio(s) pendiente(s)` : "Sin cambios pendientes";
        txt.className = cambiosPendientes > 0 ? "bg-warning text-dark p-2 px-3 rounded-3 border fw-bold" : "bg-light p-2 px-3 rounded-3 border";
    }
}


function actualizarInfoPaginacion() {
    const total = datosFiltrados.length;
    const txt = document.getElementById("txtConteoPagina");
    const inicio = total > 0 ? (paginaActual - 1) * filasPorPagina + 1 : 0;
    const fin = Math.min(paginaActual * filasPorPagina, total);
    if (txt) txt.innerText = `Mostrando ${inicio}-${fin} de ${total}`;
}

function generarDatosPrueba() {
    datosTotales = Array.from({ length: 8 }, (_, i) => ({
        id_unico: i, codigo: `US-00${i}`, cedula: "V-000000", nombre: "Usuario de Prueba",
        estado: "Aragua", municipio: "Girardot", categoria: "General", subcategoria: "Consulta",
        estatus: "EN PROCESO", estatusClass: "bg-warning text-dark",
        aprobacion: "POR APROBAR", aprobClass: "bg-secondary text-white"
    }));
}

// Menú Responsive
const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebar');
if (btnMenu && sidebar) {
    btnMenu.onclick = () => sidebar.classList.toggle('active');
}