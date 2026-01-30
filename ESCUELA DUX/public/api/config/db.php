<?php
/**
 * Database Configuration - Singleton Pattern con PDO
 * Escuela DUX - Backend API
 * 
 * @author Senior LAMP Stack Architect
 * @version 1.0.0
 */

// Prevenir acceso directo
if (!defined('API_ACCESS')) {
    define('API_ACCESS', true);
}

/**
 * Clase Database - Implementa patrón Singleton para conexión PDO
 */
class Database {
    // Credenciales de producción
    private const DB_HOST = 'localhost';
    private const DB_NAME = 'david_escuelaDux';
    private const DB_USER = 'david_duxAdmin';
    private const DB_PASS = 'nu8zuagzz65VX2D';
    private const DB_CHARSET = 'utf8mb4';

    // Instancia singleton
    private static ?Database $instance = null;
    
    // Conexión PDO
    private ?PDO $connection = null;

    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        $this->connect();
    }

    /**
     * Previene clonación
     */
    private function __clone() {}

    /**
     * Previene deserialización
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    /**
     * Obtiene la instancia única de la base de datos
     * @return Database
     */
    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Establece la conexión PDO
     */
    private function connect(): void {
        try {
            $dsn = sprintf(
                "mysql:host=%s;dbname=%s;charset=%s",
                self::DB_HOST,
                self::DB_NAME,
                self::DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . self::DB_CHARSET
            ];

            $this->connection = new PDO($dsn, self::DB_USER, self::DB_PASS, $options);
            
        } catch (PDOException $e) {
            // Log error (en producción, no exponer detalles)
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Error de conexión a la base de datos");
        }
    }

    /**
     * Obtiene la conexión PDO
     * @return PDO
     */
    public function getConnection(): PDO {
        return $this->connection;
    }

    /**
     * Ejecuta una consulta preparada
     * @param string $sql SQL query
     * @param array $params Parámetros
     * @return PDOStatement
     */
    public function query(string $sql, array $params = []): PDOStatement {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Obtiene un solo registro
     * @param string $sql SQL query
     * @param array $params Parámetros
     * @return array|false
     */
    public function fetchOne(string $sql, array $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    /**
     * Obtiene todos los registros
     * @param string $sql SQL query
     * @param array $params Parámetros
     * @return array
     */
    public function fetchAll(string $sql, array $params = []): array {
        return $this->query($sql, $params)->fetchAll();
    }

    /**
     * Inserta un registro y retorna el ID
     * @param string $table Nombre de la tabla
     * @param array $data Datos a insertar
     * @return int ID insertado
     */
    public function insert(string $table, array $data): int {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, $data);
        
        return (int) $this->connection->lastInsertId();
    }

    /**
     * Actualiza registros
     * @param string $table Nombre de la tabla
     * @param array $data Datos a actualizar
     * @param string $where Condición WHERE
     * @param array $whereParams Parámetros del WHERE
     * @return int Filas afectadas
     */
    public function update(string $table, array $data, string $where, array $whereParams = []): int {
        $set = [];
        foreach (array_keys($data) as $column) {
            $set[] = "{$column} = :{$column}";
        }
        $setString = implode(', ', $set);
        
        $sql = "UPDATE {$table} SET {$setString} WHERE {$where}";
        $stmt = $this->query($sql, array_merge($data, $whereParams));
        
        return $stmt->rowCount();
    }

    /**
     * Elimina registros
     * @param string $table Nombre de la tabla
     * @param string $where Condición WHERE
     * @param array $params Parámetros
     * @return int Filas afectadas
     */
    public function delete(string $table, string $where, array $params = []): int {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Inicia una transacción
     */
    public function beginTransaction(): void {
        $this->connection->beginTransaction();
    }

    /**
     * Confirma la transacción
     */
    public function commit(): void {
        $this->connection->commit();
    }

    /**
     * Revierte la transacción
     */
    public function rollback(): void {
        $this->connection->rollBack();
    }
}

/**
 * Configura headers CORS y JSON
 */
function setupHeaders(): void {
    // Headers CORS
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");

    // Manejar preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Envía respuesta JSON
 * @param mixed $data Datos a enviar
 * @param int $statusCode Código HTTP
 */
function jsonResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Envía respuesta de error
 * @param string $message Mensaje de error
 * @param int $statusCode Código HTTP
 */
function errorResponse(string $message, int $statusCode = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $statusCode);
}

/**
 * Envía respuesta exitosa
 * @param mixed $data Datos
 * @param string $message Mensaje
 */
function successResponse($data = null, string $message = 'OK'): void {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    jsonResponse($response);
}

/**
 * Obtiene datos JSON del body de la petición
 * @return array
 */
function getJsonInput(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

/**
 * Valida campos requeridos
 * @param array $data Datos recibidos
 * @param array $required Campos requeridos
 * @return bool
 */
function validateRequired(array $data, array $required): bool {
    foreach ($required as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            return false;
        }
    }
    return true;
}

/**
 * Sanitiza input de texto
 * @param string $input
 * @return string
 */
function sanitize(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Valida formato de email
 * @param string $email
 * @return bool
 */
function isValidEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}
