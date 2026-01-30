<?php
/**
 * API Endpoint: Student Dashboard Data
 * GET /api/student/dashboard_data.php
 * 
 * Retorna cursos aprobados, tareas pendientes y notas
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Método no permitido', 405);
}

try {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;

    if (!$studentId) {
        errorResponse('student_id es requerido', 400);
    }

    $db = Database::getInstance();

    // Verificar que el estudiante existe
    $student = $db->fetchOne(
        "SELECT id, full_name, email FROM users WHERE id = :id AND role_id = 3",
        ['id' => $studentId]
    );

    if (!$student) {
        errorResponse('Estudiante no encontrado', 404);
    }

    // Obtener cursos inscritos (aprobados)
    $courses = $db->fetchAll(
        "SELECT c.id, c.title, c.description, c.schedule_days, 
                c.schedule_time, c.shift, c.total_classes, c.total_hours,
                c.modality, c.image_url,
                t.id as teacher_id, t.full_name as teacher_name,
                e.created_at as enrolled_at, e.status as enrollment_status
         FROM courses c
         INNER JOIN enrollments e ON c.id = e.course_id
         LEFT JOIN users t ON c.teacher_id = t.id
         WHERE e.user_id = :student_id AND e.status = 'approved'
         ORDER BY e.created_at DESC",
        ['student_id' => $studentId]
    );

    // Obtener IDs de cursos para queries posteriores
    $courseIds = array_column($courses, 'id');
    
    $assignments = [];
    $submissions = [];
    $recordings = [];
    $materials = [];

    if (count($courseIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($courseIds), '?'));

        // Obtener tareas de los cursos
        $assignments = $db->fetchAll(
            "SELECT a.id, a.course_id, a.title, a.description, a.due_date, a.max_grade,
                    c.title as course_title,
                    (SELECT s.id FROM submissions s 
                     WHERE s.assignment_id = a.id AND s.student_id = ? LIMIT 1) as submission_id,
                    (SELECT s.status FROM submissions s 
                     WHERE s.assignment_id = a.id AND s.student_id = ? LIMIT 1) as submission_status,
                    (SELECT s.grade FROM submissions s 
                     WHERE s.assignment_id = a.id AND s.student_id = ? LIMIT 1) as grade
             FROM assignments a
             INNER JOIN courses c ON a.course_id = c.id
             WHERE a.course_id IN ({$placeholders}) AND a.is_active = 1
             ORDER BY a.due_date ASC",
            array_merge([$studentId, $studentId, $studentId], $courseIds)
        );

        // Obtener clases grabadas
        $recordings = $db->fetchAll(
            "SELECT cr.id, cr.course_id, cr.title, cr.description, 
                    cr.video_url, cr.duration_minutes, cr.class_number,
                    c.title as course_title
             FROM class_recordings cr
             INNER JOIN courses c ON cr.course_id = c.id
             WHERE cr.course_id IN ({$placeholders}) AND cr.is_active = 1
             ORDER BY cr.class_number ASC",
            $courseIds
        );

        // Obtener materiales
        $materials = $db->fetchAll(
            "SELECT cm.id, cm.course_id, cm.title, cm.description, 
                    cm.file_url, cm.file_type,
                    c.title as course_title
             FROM course_materials cm
             INNER JOIN courses c ON cm.course_id = c.id
             WHERE cm.course_id IN ({$placeholders}) AND cm.is_active = 1
             ORDER BY cm.created_at DESC",
            $courseIds
        );
    }

    // Calcular estadísticas
    $pendingAssignments = array_filter($assignments, function($a) {
        return $a['submission_status'] === null && 
               ($a['due_date'] === null || strtotime($a['due_date']) >= strtotime('today'));
    });

    $gradedAssignments = array_filter($assignments, function($a) {
        return $a['grade'] !== null;
    });

    $averageGrade = 0;
    if (count($gradedAssignments) > 0) {
        $totalGrades = array_sum(array_column($gradedAssignments, 'grade'));
        $averageGrade = round($totalGrades / count($gradedAssignments), 2);
    }

    successResponse([
        'student' => [
            'id' => (int) $student['id'],
            'name' => $student['full_name'],
            'email' => $student['email']
        ],
        'stats' => [
            'enrolled_courses' => count($courses),
            'pending_assignments' => count($pendingAssignments),
            'completed_assignments' => count($gradedAssignments),
            'average_grade' => $averageGrade
        ],
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
                'image_url' => $c['image_url'],
                'teacher' => [
                    'id' => (int) $c['teacher_id'],
                    'name' => $c['teacher_name']
                ],
                'enrolled_at' => $c['enrolled_at']
            ];
        }, $courses),
        'assignments' => array_map(function($a) {
            return [
                'id' => (int) $a['id'],
                'course_id' => (int) $a['course_id'],
                'course_title' => $a['course_title'],
                'title' => $a['title'],
                'description' => $a['description'],
                'due_date' => $a['due_date'],
                'max_grade' => (float) $a['max_grade'],
                'submission' => $a['submission_id'] ? [
                    'id' => (int) $a['submission_id'],
                    'status' => $a['submission_status'],
                    'grade' => $a['grade'] ? (float) $a['grade'] : null
                ] : null
            ];
        }, $assignments),
        'recordings' => array_map(function($r) {
            return [
                'id' => (int) $r['id'],
                'course_id' => (int) $r['course_id'],
                'course_title' => $r['course_title'],
                'title' => $r['title'],
                'description' => $r['description'],
                'video_url' => $r['video_url'],
                'duration_minutes' => (int) $r['duration_minutes'],
                'class_number' => (int) $r['class_number']
            ];
        }, $recordings),
        'materials' => array_map(function($m) {
            return [
                'id' => (int) $m['id'],
                'course_id' => (int) $m['course_id'],
                'course_title' => $m['course_title'],
                'title' => $m['title'],
                'description' => $m['description'],
                'file_url' => $m['file_url'],
                'file_type' => $m['file_type']
            ];
        }, $materials)
    ]);

} catch (Exception $e) {
    error_log("Student Dashboard Error: " . $e->getMessage());
    errorResponse('Error al obtener datos del dashboard', 500);
}
