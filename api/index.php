<?php
// Punto de entrada de la API: todo /api/* llega acá (ver .htaccess de la raíz).
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/utils/EnvLoader.php';
require_once __DIR__ . '/config/database.php';

// Autoload simple: App\Models\VehiculoModel -> api/models/VehiculoModel.php
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') !== 0) return;
    $partes = explode('\\', substr($class, 4));
    $partes[0] = strtolower($partes[0]);
    $archivo = __DIR__ . '/' . implode('/', $partes) . '.php';
    if (file_exists($archivo)) require_once $archivo;
});

\App\Utils\EnvLoader::load(__DIR__ . '/../.env');

try {
    $db = (new Database())->getConnection();

    $router = new \App\Utils\Router('/api', $db);

    $router->get('/estado',        'EstadoController@ver');

    $router->get('/marcas',        'MarcaController@listar');

    $router->get('/vehiculos',     'VehiculoController@listar');
    $router->post('/vehiculos',    'VehiculoController@crear');
    $router->get('/vehiculos/:id', 'VehiculoController@ver');
    $router->put('/vehiculos/:id', 'VehiculoController@actualizar');

    $router->run();
} catch (Throwable $e) {
    error_log('[API] ' . $e->getMessage()); // se ve con: docker compose logs app
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error interno del servidor. Revisa la conexión con la base de datos.'
    ], JSON_UNESCAPED_UNICODE);
}
