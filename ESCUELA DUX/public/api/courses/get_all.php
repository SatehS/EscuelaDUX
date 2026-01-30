<?php
/**
 * API Endpoint: Get All Courses
 * GET /api/courses/get_all.php
 * 
 * Lista todos los cursos disponibles (público)
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Método no permitido', 405);
}

try {
    $db = Database::getInstance();

    // Parámetros opcionales
    $activeOnly = !isset($_GET['include_inactive']);
    $modality = isset($_GET['modality']) ? sanitize($_GET['modality']) : null;

    // Construir query
    $whereConditions = [];
    $params = [];

    if ($activeOnly) {
        $whereConditions[] = "c.is_active = 1";
    }

    if ($modality && in_array($modality, ['online', 'presencial', 'hybrid'])) {
        $whereConditions[] = "c.modality = :modality";
        $params['modality'] = $modality;
    }

    $whereClause = count($whereConditions) > 0 
        ? 'WHERE ' . implode(' AND ', $whereConditions) 
        : '';

    $courses = $db->fetchAll(
        "SELECT c.id, c.title, c.description, c.schedule_days, c.schedule_time,
                c.shift, c.total_classes, c.total_hours, c.price_cop, c.price_usd,
                c.image_url, c.modality, c.is_active,
                t.id as teacher_id, t.full_name as teacher_name
         FROM courses c
         LEFT JOIN users t ON c.teacher_id = t.id
         {$whereClause}
         ORDER BY c.title",
        $params
    );

    $formattedCourses = array_map(function($c) {
        return [
            'id' => (int) $c['id'],
            'title' => $c['title'],
            'description' => $c['description'],
            'schedule' => [
                'days' => $c['schedule_days'],
                'time' => $c['schedule_time'],
                'shift' => $c['shift']
            ],
            'total_classes' => (int) $c['total_classes'],
            'total_hours' => (int) $c['total_hours'],
            'price' => [
                'cop' => $c['price_cop'] ? (float) $c['price_cop'] : null,
                'usd' => $c['price_usd'] ? (float) $c['price_usd'] : null
            ],
            'image_url' => $c['image_url'],
            'modality' => $c['modality'],
            'is_active' => (bool) $c['is_active'],
            'teacher' => $c['teacher_id'] ? [
                'id' => (int) $c['teacher_id'],
                'name' => $c['teacher_name']
            ] : null
        ];
    }, $courses);

    successResponse([
        'courses' => $formattedCourses,
        'total' => count($formattedCourses)
    ]);

} catch (Exception $e) {
    error_log("Get Courses Error: " . $e->getMessage());
    errorResponse('Error al obtener cursos', 500);
}
