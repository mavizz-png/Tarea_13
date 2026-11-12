<?php
namespace App\Models;

class VehiculoModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Listado: vehículo + su marca + si ya fue vendido (tabla VENTAS)
    public function listar() {
        $sql = 'SELECT v.id_vehiculo, v.id_marca, m.nombre_marca, v.modelo, v.anio, v.precio, v.estado,
                       (vt.id_venta IS NOT NULL) AS vendido
                FROM VEHICULOS v
                LEFT JOIN MARCAS m  ON m.id_marca = v.id_marca
                LEFT JOIN VENTAS vt ON vt.id_vehiculo = v.id_vehiculo
                ORDER BY m.nombre_marca, v.modelo';
        $filas = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($filas as &$f) $f['vendido'] = (bool) $f['vendido'];
        return $filas;
    }

    // Detalle: todo lo del auto + marca + datos de la venta (si existe)
    public function obtener($id) {
        $sql = 'SELECT v.id_vehiculo, v.id_marca, m.nombre_marca, m.pais_origen,
                       v.modelo, v.anio, v.precio, v.estado,
                       vt.id_venta, vt.fecha_venta, vt.monto_total,
                       c.nombre_completo AS cliente, e.nombre_completo AS empleado
                FROM VEHICULOS v
                LEFT JOIN MARCAS m    ON m.id_marca = v.id_marca
                LEFT JOIN VENTAS vt   ON vt.id_vehiculo = v.id_vehiculo
                LEFT JOIN CLIENTES c  ON c.id_cliente = vt.id_cliente
                LEFT JOIN EMPLEADOS e ON e.id_empleado = vt.id_empleado
                WHERE v.id_vehiculo = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $fila = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$fila) return null;
        $fila['vendido'] = $fila['id_venta'] !== null;
        return $fila;
    }

    public function crear(array $d) {
        $stmt = $this->db->prepare(
            'INSERT INTO VEHICULOS (id_marca, modelo, anio, precio, estado)
             VALUES (:id_marca, :modelo, :anio, :precio, :estado)'
        );
        $stmt->execute([
            ':id_marca' => $d['id_marca'],
            ':modelo'   => $d['modelo'],
            ':anio'     => $d['anio'],
            ':precio'   => $d['precio'],
            ':estado'   => $d['estado'],
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function actualizar($id, array $d) {
        $stmt = $this->db->prepare(
            'UPDATE VEHICULOS
             SET id_marca = :id_marca, modelo = :modelo, anio = :anio, precio = :precio, estado = :estado
             WHERE id_vehiculo = :id'
        );
        $stmt->execute([
            ':id_marca' => $d['id_marca'],
            ':modelo'   => $d['modelo'],
            ':anio'     => $d['anio'],
            ':precio'   => $d['precio'],
            ':estado'   => $d['estado'],
            ':id'       => $id,
        ]);
    }
}
