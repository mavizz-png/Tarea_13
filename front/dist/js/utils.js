// front/dist/js/utils.js
// Funciones de ayuda compartidas por todas las páginas.

const Util = {
    // Evita que un texto con <, > o comillas rompa el HTML (o inyecte código)
    esc(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    },

    dato(valor) {
        return valor === null || valor === undefined || valor === '' ? 'Sin dato' : Util.esc(valor);
    },

    precio(valor) {
        if (valor === null || valor === undefined || valor === '') return 'Sin dato';
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD' }).format(Number(valor));
    },

    fecha(iso) {
        if (!iso) return 'Sin dato';
        const [a, m, d] = iso.split('-');
        return `${d}/${m}/${a}`;
    },

    etiquetaEstado(estado) {
        if (!estado) return '<span class="text-muted">Sin dato</span>';
        const clase = estado === 'Nuevo' ? 'etiqueta-nuevo' : 'etiqueta-usado';
        return `<span class="etiqueta ${clase}">${Util.esc(estado)}</span>`;
    },

    etiquetaVenta(vendido) {
        return vendido
            ? '<span class="etiqueta etiqueta-vendido">Vendido</span>'
            : '<span class="etiqueta etiqueta-nuevo">Disponible</span>';
    },

    // tipo: 'success' | 'danger' | 'warning' | 'info'
    mostrarAlerta(contenedor, tipo, texto) {
        contenedor.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible" role="alert">
                ${Util.esc(texto)}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
            </div>`;
    },

    idDeUrl() {
        return new URLSearchParams(window.location.search).get('id');
    },

    // Mensaje que sobrevive a una redirección (ej.: "Auto agregado" en el listado)
    guardarMensaje(mensaje) {
        try { sessionStorage.setItem('mensaje', JSON.stringify(mensaje)); } catch (e) { /* sin storage: no pasa nada */ }
    },
    tomarMensaje() {
        try {
            const crudo = sessionStorage.getItem('mensaje');
            sessionStorage.removeItem('mensaje');
            return crudo ? JSON.parse(crudo) : null;
        } catch (e) { return null; }
    }
};
