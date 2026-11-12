<?php
namespace App\Controllers;

use App\Models\MarcaModel;

class MarcaController {
    private $marcas;

    public function __construct($db) {
        $this->marcas = new MarcaModel($db);
    }

    public function listar() {
        echo json_encode(['status' => 'ok', 'data' => $this->marcas->listar()], JSON_UNESCAPED_UNICODE);
    }
}
