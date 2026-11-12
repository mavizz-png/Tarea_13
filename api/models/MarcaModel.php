<?php
namespace App\Models;

class MarcaModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function listar() {
        $stmt = $this->db->query('SELECT id_marca, nombre_marca, pais_origen FROM MARCAS ORDER BY nombre_marca');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function existe($idMarca) {
        $stmt = $this->db->prepare('SELECT 1 FROM MARCAS WHERE id_marca = :id');
        $stmt->execute([':id' => $idMarca]);
        return (bool) $stmt->fetchColumn();
    }
}
