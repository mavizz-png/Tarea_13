<?php
namespace App\Controllers;

use App\Models\VehiculoModel;
use App\Models\MarcaModel;

class VehiculoController {
    private $vehiculos;
    private $marcas;

    public function __construct($db) {
        $this->vehiculos = new VehiculoModel($db);
        $this->marcas    = new MarcaModel($db);
    }

    // GET /api/vehiculos
    public function listar() {
        $this->responder(200, ['status' => 'ok', 'data' => $this->vehiculos->listar()]);
    }

    // GET /api/vehiculos/:id
    public function ver($id) {
        $auto = $this->buscarOError($id);
        if (!$auto) return;
        $this->responder(200, ['status' => 'ok', 'data' => $auto]);
    }

    // POST /api/vehiculos
    public function crear() {
        $datos = $this->leerJson();
        if ($datos === null) return;

        list($errores, $limpio) = $this->validar($datos);
        if ($errores) return $this->errorValidacion($errores);

        $id = $this->vehiculos->crear($limpio);
        $this->responder(201, [
            'status'  => 'ok',
            'message' => 'El auto se agregó correctamente.',
            'data'    => $this->vehiculos->obtener($id)
        ]);
    }

    // PUT /api/vehiculos/:id
    public function actualizar($id) {
        if (!$this->buscarOError($id)) return;

        $datos = $this->leerJson();
        if ($datos === null) return;

        list($errores, $limpio) = $this->validar($datos);
        if ($errores) return $this->errorValidacion($errores);

        $this->vehiculos->actualizar((int) $id, $limpio);
        $this->responder(200, [
            'status'  => 'ok',
            'message' => 'Los datos del auto se modificaron correctamente.',
            'data'    => $this->vehiculos->obtener((int) $id)
        ]);
    }

    // ---------- Auxiliares ----------

    private function buscarOError($id) {
        $auto = ctype_digit((string) $id) ? $this->vehiculos->obtener((int) $id) : null;
        if (!$auto) {
            $this->responder(404, ['status' => 'error', 'message' => 'El auto solicitado no existe.']);
            return null;
        }
        return $auto;
    }

    private function leerJson() {
        $datos = json_decode(file_get_contents('php://input'), true);
        if (!is_array($datos)) {
            $this->responder(400, ['status' => 'error', 'message' => 'Los datos enviados no son válidos.']);
            return null;
        }
        return $datos;
    }

    // Validación en el servidor (la del navegador no alcanza: se puede saltear)
    private function validar(array $d) {
        $errores = [];

        $modelo = trim((string) ($d['modelo'] ?? ''));
        if ($modelo === '') {
            $errores['modelo'] = 'El modelo es obligatorio.';
        } elseif (mb_strlen($modelo) > 50) {
            $errores['modelo'] = 'El modelo admite hasta 50 caracteres.';
        }

        $idMarca = $d['id_marca'] ?? '';
        if (!ctype_digit((string) $idMarca)) {
            $errores['id_marca'] = 'Selecciona una marca.';
        } elseif (!$this->marcas->existe((int) $idMarca)) {
            $errores['id_marca'] = 'La marca seleccionada no existe.';
        }

        $anio = filter_var($d['anio'] ?? '', FILTER_VALIDATE_INT);
        $anioMax = (int) date('Y') + 1;
        if ($anio === false || $anio < 1900 || $anio > $anioMax) {
            $errores['anio'] = "Ingresa un año entre 1900 y $anioMax.";
        }

        $precio = $d['precio'] ?? '';
        if (!is_numeric($precio) || $precio < 0 || $precio > 99999999.99) {
            $errores['precio'] = 'Ingresa un precio válido (0 o mayor).';
        }

        $estado = (string) ($d['estado'] ?? '');
        if (!in_array($estado, ['Nuevo', 'Usado'], true)) {
            $errores['estado'] = 'Selecciona Nuevo o Usado.';
        }

        $limpio = [
            'id_marca' => (int) $idMarca,
            'modelo'   => $modelo,
            'anio'     => $anio,
            'precio'   => is_numeric($precio) ? round((float) $precio, 2) : null,
            'estado'   => $estado,
        ];
        return [$errores, $limpio];
    }

    private function errorValidacion(array $errores) {
        $this->responder(422, [
            'status'  => 'error',
            'message' => 'Revisa los campos marcados.',
            'errores' => $errores
        ]);
    }

    private function responder($codigo, array $datos) {
        http_response_code($codigo);
        echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    }
}
