<?php
/**
 * API Endpoint: Grade Submission
 * POST /api/teacher/grade_submission.php
 * 
 * Califica una entrega de tarea
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método no permitido', 405);
}

try {
    $input = getJsonInput();
    
    // Validar campos requeridos
    if (!validateRequired($input, ['submission_id', 'grade', 'teacher_id'])) {
        errorResponse('ID de entrega, calificación y profesor son requeridos', 400);
    }

    $submissionId = (int) $input['submission_id'];
    $teacherId = (int) $input['teacher_id'];
    $grade = (float) $input['grade'];
    $feedback = isset($input['feedback']) ? sanitize($input['feedback']) : null;

    // Validar calificación
    if ($grade < 0 || $grade > 100) {
        errorResponse('La calificación debe estar entre 0 y 100', 400);
    }

    $db = Database::getInstance();

    // Verificar que la entrega existe y el profesor tiene acceso
    $submission = $db->fetchOne(
        "SELECT s.id, s.student_id, s.assignment_id, s.status,
                a.title as assignment_title, a.max_grade,
                c.id as course_id, c.teacher_id,
                u.full_name as student_name
         FROM submissions s
         INNER JOIN assignments a ON s.assignment_id = a.id
         INNER JOIN courses c ON a.course_id = c.id
         INNER JOIN users u ON s.student_id = u.id
         WHERE s.id = :id",
        ['id' => $submissionId]
    );

    if (!$submission) {
        errorResponse('Entrega no encontrada', 404);
    }

    if ((int) $submission['teacher_id'] !== $teacherId) {
        errorResponse('No tienes permisos para calificar esta entrega', 403);
    }

    // Ajustar calificación al máximo permitido
    $maxGrade = (float) $submission['max_grade'];
    if ($grade > $maxGrade) {
        $grade = $maxGrade;
    }

    // Actualizar entrega
    $db->update('submissions', [
        'grade' => $grade,
        'feedback' => $feedback,
        'graded_by' => $teacherId,
        'graded_at' => date('Y-m-d H:i:s'),
        'status' => 'graded'
    ], 'id = :id', ['id' => $submissionId]);

    successResponse([
        'submission' => [
            'id' => $submissionId,
            'student_name' => $submission['student_name'],
            'assignment_title' => $submission['assignment_title'],
            'grade' => $grade,
            'max_grade' => $maxGrade,
            'feedback' => $feedback,
            'status' => 'graded'
        ]
    ], 'Calificación guardada exitosamente');

} catch (Exception $e) {
    error_log("Grade Submission Error: " . $e->getMessage());
    errorResponse('Error al guardar calificación', 500);
}
