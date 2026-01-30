<?php
/**
 * API Endpoint: Teacher Dashboard Data
 * GET /api/teacher/dashboard_data.php
 * 
 * Retorna cursos asignados y alumnos inscritos
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Método no permitido', 405);
}

try {
    // Obtener teacher_id del query param
    $teacherId = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : null;

    if (!$teacherId) {
        errorResponse('teacher_id es requerido', 400);
    }

    $db = Database::getInstance();

    // Verificar que el profesor existe
    $teacher = $db->fetchOne(
        "SELECT id, full_name FROM users WHERE id = :id AND role_id = 2",
        ['id' => $teacherId]
    );

    if (!$teacher) {
        errorResponse('Profesor no encontrado', 404);
    }

    // Obtener cursos asignados al profesor
    $courses = $db->fetchAll(
        "SELECT c.id, c.title, c.description, c.schedule_days, 
                c.schedule_time, c.shift, c.total_classes, c.total_hours,
                c.modality, c.is_active,
                (SELECT COUNT(*) FROM enrollments e 
                 WHERE e.course_id = c.id AND e.status = 'approved') as student_count
         FROM courses c
         WHERE c.teacher_id = :teacher_id AND c.is_active = 1
         ORDER BY c.title",
        ['teacher_id' => $teacherId]
    );

    // Obtener alumnos inscritos en los cursos del profesor
    $students = $db->fetchAll(
        "SELECT DISTINCT u.id, u.full_name, u.email, u.avatar_url,
                c.id as course_id, c.title as course_title,
                e.status as enrollment_status, e.created_at as enrolled_at
         FROM users u
         INNER JOIN enrollments e ON u.id = e.user_id
         INNER JOIN courses c ON e.course_id = c.id
         WHERE c.teacher_id = :teacher_id AND e.status = 'approved'
         ORDER BY c.title, u.full_name",
        ['teacher_id' => $teacherId]
    );

    // Obtener tareas pendientes de calificar
    $pendingSubmissions = $db->fetchAll(
        "SELECT s.id, s.file_url, s.submitted_at, s.comments,
                a.id as assignment_id, a.title as assignment_title,
                u.id as student_id, u.full_name as student_name,
                c.id as course_id, c.title as course_title
         FROM submissions s
         INNER JOIN assignments a ON s.assignment_id = a.id
         INNER JOIN courses c ON a.course_id = c.id
         INNER JOIN users u ON s.student_id = u.id
         WHERE c.teacher_id = :teacher_id AND s.status = 'submitted'
         ORDER BY s.submitted_at ASC",
        ['teacher_id' => $teacherId]
    );

    // Estadísticas rápidas
    $stats = [
        'total_courses' => count($courses),
        'total_students' => count(array_unique(array_column($students, 'id'))),
        'pending_grades' => count($pendingSubmissions)
    ];

    successResponse([
        'teacher' => [
            'id' => (int) $teacher['id'],
            'name' => $teacher['full_name']
        ],
        'stats' => $stats,
        'courses' => array_map(function($c) {
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
                'modality' => $c['modality'],
                'student_count' => (int) $c['student_count']
            ];
        }, $courses),
        'students' => array_map(function($s) {
            return [
                'id' => (int) $s['id'],
                'name' => $s['full_name'],
                'email' => $s['email'],
                'avatar_url' => $s['avatar_url'],
                'course' => [
                    'id' => (int) $s['course_id'],
                    'title' => $s['course_title']
                ],
                'enrolled_at' => $s['enrolled_at']
            ];
        }, $students),
        'pending_submissions' => array_map(function($p) {
            return [
                'id' => (int) $p['id'],
                'assignment' => [
                    'id' => (int) $p['assignment_id'],
                    'title' => $p['assignment_title']
                ],
                'student' => [
                    'id' => (int) $p['student_id'],
                    'name' => $p['student_name']
                ],
                'course' => [
                    'id' => (int) $p['course_id'],
                    'title' => $p['course_title']
                ],
                'file_url' => $p['file_url'],
                'submitted_at' => $p['submitted_at']
            ];
        }, $pendingSubmissions)
    ]);

} catch (Exception $e) {
    error_log("Teacher Dashboard Error: " . $e->getMessage());
    errorResponse('Error al obtener datos del dashboard', 500);
}
