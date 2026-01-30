<?php
/**
 * API Endpoint: Get Users (Admin)
 * GET /api/admin/get_users.php
 * 
 * Lista todos los alumnos y profesores
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Método no permitido', 405);
}

try {
    $db = Database::getInstance();
    
    // Parámetros de filtrado opcionales
    $roleFilter = isset($_GET['role']) ? sanitize($_GET['role']) : null;
    $search = isset($_GET['search']) ? sanitize($_GET['search']) : null;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(10, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // Construir query base
    $whereConditions = [];
    $params = [];

    // Excluir admins de la lista general (opcional)
    // $whereConditions[] = "r.name != 'admin'";

    // Filtro por rol
    if ($roleFilter && in_array($roleFilter, ['student', 'teacher', 'admin'])) {
        $whereConditions[] = "r.name = :role";
        $params['role'] = $roleFilter;
    }

    // Búsqueda por nombre o email
    if ($search) {
        $whereConditions[] = "(u.full_name LIKE :search OR u.email LIKE :search)";
        $params['search'] = "%{$search}%";
    }

    $whereClause = count($whereConditions) > 0 
        ? 'WHERE ' . implode(' AND ', $whereConditions) 
        : '';

    // Query para obtener usuarios
    $sql = "SELECT u.id, u.full_name, u.email, u.phone, u.country, 
                   u.avatar_url, u.is_active, u.created_at, u.last_login,
                   r.id as role_id, r.name as role_name
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            {$whereClause}
            ORDER BY u.created_at DESC
            LIMIT {$limit} OFFSET {$offset}";

    $users = $db->fetchAll($sql, $params);

    // Query para contar total
    $countSql = "SELECT COUNT(*) as total 
                 FROM users u 
                 INNER JOIN roles r ON u.role_id = r.id 
                 {$whereClause}";
    
    $totalResult = $db->fetchOne($countSql, $params);
    $total = (int) $totalResult['total'];

    // Formatear datos
    $formattedUsers = array_map(function($user) {
        return [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'country' => $user['country'],
            'avatar_url' => $user['avatar_url'],
            'is_active' => (bool) $user['is_active'],
            'created_at' => $user['created_at'],
            'last_login' => $user['last_login'],
            'role' => [
                'id' => (int) $user['role_id'],
                'name' => $user['role_name']
            ]
        ];
    }, $users);

    successResponse([
        'users' => $formattedUsers,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);

} catch (Exception $e) {
    error_log("Get Users Error: " . $e->getMessage());
    errorResponse('Error al obtener usuarios', 500);
}
