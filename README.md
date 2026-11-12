# Tarea 13 — Fullstack: gestión de autos

Aplicación web para **listar, ver, modificar y agregar vehículos** de una automotora.
Usa PHP 8.2 + Apache (API con arquitectura MVC), MySQL 8 y un front en HTML/Bootstrap/JavaScript, todo levantado con Docker Compose.

**Integrantes:** _Nombre Apellido_, _Nombre Apellido_ <!-- completar -->

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) con Docker Compose.
- Los puertos **8080**, **8081** y **3306** libres.

## Cómo levantar la aplicación

```bash
git clone <URL-DEL-REPOSITORIO>
cd <carpeta-del-repositorio>
docker compose up -d
```

El archivo `.env` ya está incluido en el repositorio (si no existiera: `cp .env.example .env`).
La primera vez Docker descarga las imágenes y MySQL importa `api/config/init.sql`; esperar unos 20–30 segundos.

| Servicio | URL |
|---|---|
| Aplicación web | http://localhost:8080 |
| Estado de la API | http://localhost:8080/api/estado |
| phpMyAdmin (usuario `root`, clave `root_password`) | http://localhost:8081 |

## Qué se puede hacer

| Pantalla | Archivo | Qué hace |
|---|---|---|
| Listado | `front/index.html` | Muestra todos los autos (marca, modelo, año, precio, estado y disponibilidad). Tiene buscador. Clic en un auto abre su ficha. |
| Detalle | `front/dist/pages/auto.html?id=N` | Toda la información del auto, la marca y, si fue vendido, los datos de la venta. |
| Editar | `front/dist/pages/editar.html?id=N` | Formulario precargado. Al guardar muestra el mensaje de confirmación. |
| Agregar | `front/dist/pages/agregar.html` | Elige una marca existente, completa los datos y guarda. El auto nuevo aparece resaltado en el listado. |

Los formularios validan los campos obligatorios en el navegador **y** en el servidor, y muestran mensajes de éxito o error.

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/estado` | Comprueba la API y la base de datos |
| GET | `/api/marcas` | Lista de marcas |
| GET | `/api/vehiculos` | Lista de autos con su marca |
| GET | `/api/vehiculos/:id` | Detalle de un auto |
| POST | `/api/vehiculos` | Crea un auto |
| PUT | `/api/vehiculos/:id` | Modifica un auto |

## Estructura

```
├── docker-compose.yml      app (PHP+Apache) · db (MySQL) · phpmyadmin
├── Dockerfile
├── .env / .env.example     variables de entorno
├── .htaccess               /api/* → api/index.php, raíz → front/index.html
├── api/
│   ├── index.php           rutas y arranque de la API
│   ├── config/             database.php · init.sql (base de datos)
│   ├── controllers/        validan y responden JSON
│   ├── models/             único lugar con SQL (consultas preparadas)
│   └── utils/              Router.php · EnvLoader.php
└── front/
    ├── index.html          listado
    └── dist/
        ├── css/            style.css · mobile.css
        ├── js/             api.js · utils.js · script.js · detalle.js · form.js
        └── pages/          auto.html · editar.html · agregar.html
```

## Base de datos

Se usan las tablas del `init.sql` entregado, sin modificarlas: `MARCAS` y `VEHICULOS` (relacionadas por `id_marca`), y `VENTAS`, `CLIENTES` y `EMPLEADOS` para mostrar si un auto ya fue vendido.

`init.sql` solo se ejecuta cuando el volumen de la base de datos está vacío. Para volver a los datos originales:

```bash
docker compose down -v
docker compose up -d
```

## Comandos útiles

```bash
docker compose logs -f app   # errores de PHP / API
docker compose ps            # estado de los contenedores
docker compose down          # apagar (conserva los datos)
```
