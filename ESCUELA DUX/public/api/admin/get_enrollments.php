<?php
/**
 * API Endpoint: Get Enrollments (Admin)
 * GET /api/admin/get_enrollments.php
 * 
 * Lista todas las inscripciones con filtros
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Método no permitido', 405);
}

try {
    $db = Database::getInstance();
    
    // Parámetros de filtrado
    $status = isset($_GET['status']) ? sanitize($_GET['status']) : null;
    $courseId = isset($_GET['course_id']) ? (int)$_GET['course_id'] : null;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(10, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // Construir query
    $whereConditions = [];
    $params = [];

    if ($status && in_array($status, ['pending', 'approved', 'rejected', 'cancelled'])) {
        $whereConditions[] = "e.status = :status";
        $params['status'] = $status;
    }

    if ($courseId) {
        $whereConditions[] = "e.course_id = :course_id";
        $params['course_id'] = $courseId;
    }

    $whereClause = count($whereConditions) > 0 
        ? 'WHERE ' . implode(' AND ', $whereConditions) 
        : '';

    $sql = "SELECT e.id, e.user_id, e.course_id, e.payment_method, 
                   e.payment_proof_url, e.amount_paid, e.status, 
                   e.notes, e.created_at, e.approved_at,
                   u.full_name as student_name, u.email as student_email,
                   c.title as course_title,
                   a.full_name as approved_by_name
            FROM enrollments e
            INNER JOIN users u ON e.user_id = u.id
            INNER JOIN courses c ON e.course_id = c.id
            LEFT JOIN users a ON e.approved_by = a.id
            {$whereClause}
            ORDER BY e.created_at DESC
            LIMIT {$limit} OFFSET {$offset}";

    $enrollments = $db->fetchAll($sql, $params);

    // Contar total
    $countSql = "SELECT COUNT(*) as total FROM enrollments e {$whereClause}";
    $totalResult = $db->fetchOne($countSql, $params);
    $total = (int) $totalResult['total'];

    // Formatear
    $formattedEnrollments = array_map(function($e) {
        return [
            'id' => (int) $e['id'],
            'student' => [
                'id' => (int) $e['user_id'],
                'name' => $e['student_name'],
                'email' => $e['student_email']
            ],
            'course' => [
                'id' => (int) $e['course_id'],
                'title' => $e['course_title']
            ],
            'payment_method' => $e['payment_method'],
            'payment_proof_url' => $e['payment_proof_url'],
            'amount_paid' => $e['amount_paid'] ? (float) $e['amount_paid'] : null,
            'status' => $e['status'],
            'notes' => $e['notes'],
            'created_at' => $e['created_at'],
            'approved_at' => $e['approved_at'],
            'approved_by' => $e['approved_by_name']
        ];
    }, $enrollments);

    successResponse([
        'enrollments' => $formattedEnrollments,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);

} catch (Exception $e) {
    error_log("Get Enrollments Error: " . $e->getMessage());
    errorResponse('Error al obtener inscripciones', 500);
}
