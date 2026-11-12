// front/dist/js/form.js
// Formulario compartido por "Agregar auto" y "Editar auto".
// El modo se define en <body data-modo="agregar"> o <body data-modo="editar">.

(async function () {
    const modo     = document.body.dataset.modo;
    const form     = document.getElementById('form-auto');
    const mensajes = document.getElementById('mensajes');
    const boton    = document.getElementById('btn-guardar');
    const cancelar = document.getElementById('btn-cancelar');
    const campos   = ['id_marca', 'modelo', 'anio', 'precio', 'estado'];

    const id = modo === 'editar' ? Util.idDeUrl() : null;

    // El año máximo es el próximo año (hay modelos que salen antes)
    const anioMax = new Date().getFullYear() + 1;
    form.anio.max = anioMax;
    document.getElementById('error-anio').textContent = `Ingresa un año entre 1900 y ${anioMax}.`;

    function limpiarErrores() {
        campos.forEach(c => form[c].classList.remove('is-invalid'));
    }
    campos.forEach(c => form[c].addEventListener('input', () => form[c].classList.remove('is-invalid')));

    // 1) Marcas existentes en la base de datos
    const rMarcas = await API.request('/marcas');
    if (rMarcas.status !== 'ok') {
        Util.mostrarAlerta(mensajes, 'danger', rMarcas.message || 'No se pudieron cargar las marcas.');
        return;
    }
    form.id_marca.innerHTML = '<option value="">Selecciona una marca</option>' +
        rMarcas.data.map(m => `<option value="${m.id_marca}">${Util.esc(m.nombre_marca)}</option>`).join('');

    // 2) En modo editar, precargamos los datos del auto
    if (modo === 'editar') {
        if (!id) {
            form.classList.add('d-none');
            Util.mostrarAlerta(mensajes, 'warning', 'Falta indicar qué auto quieres editar. Vuelve al listado y selecciona uno.');
            return;
        }
        const rAuto = await API.request('/vehiculos/' + encodeURIComponent(id));
        if (rAuto.status !== 'ok') {
            form.classList.add('d-none');
            Util.mostrarAlerta(mensajes, 'danger', rAuto.message || 'No se pudo cargar el auto.');
            return;
        }
        const a = rAuto.data;
        form.id_marca.value = a.id_marca ?? '';
        form.modelo.value   = a.modelo ?? '';
        form.anio.value     = a.anio ?? '';
        form.precio.value   = a.precio ?? '';
        form.estado.value   = a.estado ?? '';
        document.getElementById('titulo-auto').textContent = `${a.nombre_marca ?? ''} ${a.modelo}`.trim();
        cancelar.href = `/front/dist/pages/auto.html?id=${a.id_vehiculo}`;
    }

    // 3) Guardar
    form.addEventListener('submit', async e => {
        e.preventDefault();
        mensajes.innerHTML = '';
        limpiarErrores();

        // Validación del navegador (campos obligatorios, rangos)
        form.classList.add('was-validated');
        if (!form.checkValidity()) {
            Util.mostrarAlerta(mensajes, 'danger', 'Completa los campos obligatorios antes de guardar.');
            return;
        }

        const datos = {
            id_marca: form.id_marca.value,
            modelo:   form.modelo.value.trim(),
            anio:     form.anio.value,
            precio:   form.precio.value,
            estado:   form.estado.value
        };

        boton.disabled = true;
        const respuesta = modo === 'editar'
            ? await API.request('/vehiculos/' + encodeURIComponent(id), 'PUT', datos)
            : await API.request('/vehiculos', 'POST', datos);
        boton.disabled = false;

        if (respuesta.status === 'ok') {
            if (modo === 'editar') {
                Util.guardarMensaje({ tipo: 'success', texto: respuesta.message });
                window.location.href = `/front/dist/pages/auto.html?id=${id}`;
            } else {
                Util.guardarMensaje({ tipo: 'success', texto: respuesta.message, id: respuesta.data.id_vehiculo });
                window.location.href = '/front/index.html';
            }
            return;
        }

        // Errores devueltos por el servidor: los marcamos campo por campo
        form.classList.remove('was-validated');
        if (respuesta.errores) {
            Object.entries(respuesta.errores).forEach(([campo, texto]) => {
                if (!form[campo]) return;
                form[campo].classList.add('is-invalid');
                const caja = document.getElementById('error-' + campo);
                if (caja) caja.textContent = texto;
            });
        }
        Util.mostrarAlerta(mensajes, 'danger', respuesta.message || 'No se pudo guardar el auto.');
    });
})();
