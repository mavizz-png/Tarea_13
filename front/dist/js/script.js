// front/dist/js/script.js
// Página principal: pide los autos a la API y los pinta en la tabla.

(async function () {
    const cuerpo   = document.getElementById('tabla-cuerpo');
    const mensajes = document.getElementById('mensajes');
    const contador = document.getElementById('contador');
    const buscador = document.getElementById('buscador');

    let autos = [];
    let resaltar = null;

    // ¿Venimos de agregar un auto? Mostramos el aviso y marcamos la fila nueva.
    const aviso = Util.tomarMensaje();
    if (aviso) {
        Util.mostrarAlerta(mensajes, aviso.tipo, aviso.texto);
        resaltar = aviso.id || null;
    }

    function pintar() {
        const texto = buscador.value.trim().toLowerCase();
        const lista = autos.filter(a => `${a.nombre_marca ?? ''} ${a.modelo}`.toLowerCase().includes(texto));

        contador.textContent = texto
            ? `${lista.length} de ${autos.length} autos`
            : `${autos.length} autos registrados`;

        if (lista.length === 0) {
            cuerpo.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">
                No hay autos que coincidan. Prueba con otra búsqueda o agrega un auto nuevo.</td></tr>`;
            return;
        }

        cuerpo.innerHTML = lista.map(a => `
            <tr data-id="${a.id_vehiculo}" class="${String(a.id_vehiculo) === String(resaltar) ? 'fila-nueva' : ''}">
                <td data-label="Marca">${Util.dato(a.nombre_marca)}</td>
                <td data-label="Modelo"><a class="enlace-modelo" href="/front/dist/pages/auto.html?id=${a.id_vehiculo}">${Util.esc(a.modelo)}</a></td>
                <td data-label="Año" class="num">${Util.dato(a.anio)}</td>
                <td data-label="Precio" class="num">${Util.precio(a.precio)}</td>
                <td data-label="Estado">${Util.etiquetaEstado(a.estado)}</td>
                <td data-label="Disponibilidad">${Util.etiquetaVenta(a.vendido)}</td>
            </tr>`).join('');

        const nueva = cuerpo.querySelector('.fila-nueva');
        if (nueva) { nueva.scrollIntoView({ block: 'center' }); resaltar = null; }
    }

    // Toda la fila es clicable (el enlace del modelo sigue funcionando solo)
    cuerpo.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        const fila = e.target.closest('tr[data-id]');
        if (fila) window.location.href = `/front/dist/pages/auto.html?id=${fila.dataset.id}`;
    });

    buscador.addEventListener('input', pintar);

    const respuesta = await API.request('/vehiculos');
    if (respuesta.status === 'ok') {
        autos = respuesta.data;
        pintar();
    } else {
        contador.textContent = '';
        cuerpo.innerHTML = '';
        Util.mostrarAlerta(mensajes, 'danger', respuesta.message || 'No se pudo cargar el listado.');
    }
})();
