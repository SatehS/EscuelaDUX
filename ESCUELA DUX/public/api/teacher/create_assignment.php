<?php
/**
 * API Endpoint: Create Assignment
 * POST /api/teacher/create_assignment.php
 * 
 * Crea una nueva tarea para un curso
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
    if (!validateRequired($input, ['course_id', 'title', 'teacher_id'])) {
        errorResponse('Curso, título y profesor son requeridos', 400);
    }

    $courseId = (int) $input['course_id'];
    $teacherId = (int) $input['teacher_id'];
    $title = sanitize($input['title']);
    $description = isset($input['description']) ? sanitize($input['description']) : null;
    $dueDate = isset($input['due_date']) ? $input['due_date'] : null;
    $maxGrade = isset($input['max_grade']) ? (float) $input['max_grade'] : 100.00;

    // Validaciones
    if (strlen($title) < 3) {
        errorResponse('El título debe tener al menos 3 caracteres', 400);
    }

    $db = Database::getInstance();

    // Verificar que el curso existe y pertenece al profesor
    $course = $db->fetchOne(
        "SELECT id, title FROM courses WHERE id = :id AND teacher_id = :teacher_id",
        ['id' => $courseId, 'teacher_id' => $teacherId]
    );

    if (!$course) {
        errorResponse('Curso no encontrado o no tienes permisos', 404);
    }

    // Validar fecha de entrega si se proporciona
    if ($dueDate) {
        $dueDateObj = DateTime::createFromFormat('Y-m-d', $dueDate);
        if (!$dueDateObj || $dueDateObj->format('Y-m-d') !== $dueDate) {
            errorResponse('Formato de fecha inválido. Use YYYY-MM-DD', 400);
        }
    }

    // Insertar tarea
    $assignmentId = $db->insert('assignments', [
        'course_id' => $courseId,
        'title' => $title,
        'description' => $description,
        'due_date' => $dueDate,
        'max_grade' => $maxGrade,
        'created_by' => $teacherId
    ]);

    // Obtener tarea creada
    $assignment = $db->fetchOne(
        "SELECT * FROM assignments WHERE id = :id",
        ['id' => $assignmentId]
    );

    successResponse([
        'assignment' => [
            'id' => (int) $assignment['id'],
            'course_id' => (int) $assignment['course_id'],
            'course_title' => $course['title'],
            'title' => $assignment['title'],
            'description' => $assignment['description'],
            'due_date' => $assignment['due_date'],
            'max_grade' => (float) $assignment['max_grade'],
            'created_at' => $assignment['created_at']
        ]
    ], 'Tarea creada exitosamente');

} catch (Exception $e) {
    error_log("Create Assignment Error: " . $e->getMessage());
    errorResponse('Error al crear la tarea', 500);
}
