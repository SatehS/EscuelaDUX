<?php
/**
 * API Endpoint: Get Dashboard Stats (Admin)
 * GET /api/admin/get_stats.php
 * 
 * Retorna estadísticas generales del sistema
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Método no permitido', 405);
}

try {
    $db = Database::getInstance();

    // Total de estudiantes
    $students = $db->fetchOne(
        "SELECT COUNT(*) as total FROM users WHERE role_id = 3"
    );

    // Total de profesores
    $teachers = $db->fetchOne(
        "SELECT COUNT(*) as total FROM users WHERE role_id = 2"
    );

    // Total de cursos activos
    $courses = $db->fetchOne(
        "SELECT COUNT(*) as total FROM courses WHERE is_active = 1"
    );

    // Inscripciones pendientes
    $pendingEnrollments = $db->fetchOne(
        "SELECT COUNT(*) as total FROM enrollments WHERE status = 'pending'"
    );

    // Inscripciones este mes
    $monthlyEnrollments = $db->fetchOne(
        "SELECT COUNT(*) as total FROM enrollments 
         WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
         AND YEAR(created_at) = YEAR(CURRENT_DATE())"
    );

    // Ingresos del mes (inscripciones aprobadas)
    $monthlyRevenue = $db->fetchOne(
        "SELECT COALESCE(SUM(amount_paid), 0) as total FROM enrollments 
         WHERE status = 'approved' 
         AND MONTH(approved_at) = MONTH(CURRENT_DATE()) 
         AND YEAR(approved_at) = YEAR(CURRENT_DATE())"
    );

    // Actividad reciente (últimas 10 acciones)
    $recentActivity = $db->fetchAll(
        "SELECT e.id, e.status, e.created_at,
                u.full_name as student_name,
                c.title as course_title
         FROM enrollments e
         INNER JOIN users u ON e.user_id = u.id
         INNER JOIN courses c ON e.course_id = c.id
         ORDER BY e.created_at DESC
         LIMIT 10"
    );

    // Cursos más populares
    $popularCourses = $db->fetchAll(
        "SELECT c.id, c.title, COUNT(e.id) as enrollment_count
         FROM courses c
         LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'approved'
         WHERE c.is_active = 1
         GROUP BY c.id
         ORDER BY enrollment_count DESC
         LIMIT 5"
    );

    successResponse([
        'stats' => [
            'total_students' => (int) $students['total'],
            'total_teachers' => (int) $teachers['total'],
            'total_courses' => (int) $courses['total'],
            'pending_enrollments' => (int) $pendingEnrollments['total'],
            'monthly_enrollments' => (int) $monthlyEnrollments['total'],
            'monthly_revenue' => (float) $monthlyRevenue['total']
        ],
        'recent_activity' => array_map(function($a) {
            return [
                'id' => (int) $a['id'],
                'student_name' => $a['student_name'],
                'course_title' => $a['course_title'],
                'status' => $a['status'],
                'created_at' => $a['created_at']
            ];
        }, $recentActivity),
        'popular_courses' => array_map(function($c) {
            return [
                'id' => (int) $c['id'],
                'title' => $c['title'],
                'enrollments' => (int) $c['enrollment_count']
            ];
        }, $popularCourses)
    ]);

} catch (Exception $e) {
    error_log("Get Stats Error: " . $e->getMessage());
    errorResponse('Error al obtener estadísticas', 500);
}
