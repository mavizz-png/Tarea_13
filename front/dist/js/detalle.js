// front/dist/js/detalle.js
// Página de un auto: muestra toda su información.

(async function () {
    const contenedor = document.getElementById('detalle');
    const mensajes   = document.getElementById('mensajes');

    const aviso = Util.tomarMensaje();
    if (aviso) Util.mostrarAlerta(mensajes, aviso.tipo, aviso.texto);

    const id = Util.idDeUrl();
    if (!id) {
        contenedor.innerHTML = '';
        Util.mostrarAlerta(mensajes, 'warning', 'Falta indicar qué auto quieres ver. Vuelve al listado y selecciona uno.');
        return;
    }

    const respuesta = await API.request('/vehiculos/' + encodeURIComponent(id));
    if (respuesta.status !== 'ok') {
        contenedor.innerHTML = '';
        Util.mostrarAlerta(mensajes, 'danger', respuesta.message || 'No se pudo cargar el auto.');
        return;
    }

    const a = respuesta.data;
    document.title = `${a.nombre_marca ?? ''} ${a.modelo}`.trim() + ' | Automotora';

    const venta = a.vendido ? `
        <section class="panel p-4 mt-4">
            <h2 class="h5 mb-3">Datos de la venta</h2>
            <dl class="datos">
                <div class="fila"><dt>Fecha</dt><dd>${Util.fecha(a.fecha_venta)}</dd></div>
                <div class="fila"><dt>Monto cobrado</dt><dd>${Util.precio(a.monto_total)}</dd></div>
                <div class="fila"><dt>Cliente</dt><dd>${Util.dato(a.cliente)}</dd></div>
                <div class="fila"><dt>Vendedor</dt><dd>${Util.dato(a.empleado)}</dd></div>
            </dl>
        </section>` : '';

    contenedor.innerHTML = `
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
                <h1 class="ficha-titulo">${Util.dato(a.nombre_marca)} ${Util.esc(a.modelo)}</h1>
                <div class="d-flex gap-2 mt-2">${Util.etiquetaEstado(a.estado)} ${Util.etiquetaVenta(a.vendido)}</div>
            </div>
            <div class="ficha-precio">${Util.precio(a.precio)}</div>
        </div>

        <section class="panel p-4">
            <h2 class="h5 mb-3">Información del auto</h2>
            <dl class="datos">
                <div class="fila"><dt>Marca</dt><dd>${Util.dato(a.nombre_marca)}</dd></div>
                <div class="fila"><dt>País de origen</dt><dd>${Util.dato(a.pais_origen)}</dd></div>
                <div class="fila"><dt>Modelo</dt><dd>${Util.esc(a.modelo)}</dd></div>
                <div class="fila"><dt>Año</dt><dd>${Util.dato(a.anio)}</dd></div>
                <div class="fila"><dt>Precio</dt><dd>${Util.precio(a.precio)}</dd></div>
                <div class="fila"><dt>Estado</dt><dd>${Util.dato(a.estado)}</dd></div>
            </dl>
        </section>

        ${venta}

        <div class="d-flex flex-wrap gap-2 mt-4">
            <a class="btn btn-primary" href="/front/dist/pages/editar.html?id=${a.id_vehiculo}">Editar auto</a>
            <a class="btn btn-outline-secondary" href="/front/index.html">Volver al listado</a>
        </div>`;
})();
