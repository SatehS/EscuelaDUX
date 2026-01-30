<?php
/**
 * API Endpoint: Upload Submission
 * POST /api/student/upload_submission.php
 * 
 * Maneja la subida de tareas por estudiantes
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método no permitido', 405);
}

try {
    // Validar campos requeridos
    if (!isset($_POST['assignment_id']) || !isset($_POST['student_id'])) {
        errorResponse('assignment_id y student_id son requeridos', 400);
    }

    $assignmentId = (int) $_POST['assignment_id'];
    $studentId = (int) $_POST['student_id'];
    $comments = isset($_POST['comments']) ? sanitize($_POST['comments']) : null;

    $db = Database::getInstance();

    // Verificar que la tarea existe
    $assignment = $db->fetchOne(
        "SELECT a.id, a.course_id, a.title, a.due_date,
                c.title as course_title
         FROM assignments a
         INNER JOIN courses c ON a.course_id = c.id
         WHERE a.id = :id AND a.is_active = 1",
        ['id' => $assignmentId]
    );

    if (!$assignment) {
        errorResponse('Tarea no encontrada', 404);
    }

    // Verificar que el estudiante está inscrito en el curso
    $enrollment = $db->fetchOne(
        "SELECT id FROM enrollments 
         WHERE user_id = :student_id AND course_id = :course_id AND status = 'approved'",
        ['student_id' => $studentId, 'course_id' => $assignment['course_id']]
    );

    if (!$enrollment) {
        errorResponse('No estás inscrito en este curso', 403);
    }

    // Verificar si ya existe una entrega
    $existingSubmission = $db->fetchOne(
        "SELECT id FROM submissions WHERE assignment_id = :assignment_id AND student_id = :student_id",
        ['assignment_id' => $assignmentId, 'student_id' => $studentId]
    );

    // Manejar archivo
    $fileUrl = null;
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['file'];
        
        // Validar tamaño (máximo 10MB)
        $maxSize = 10 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            errorResponse('El archivo excede el tamaño máximo de 10MB', 400);
        }

        // Validar tipo de archivo
        $allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png'
        ];

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!in_array($mimeType, $allowedTypes)) {
            errorResponse('Tipo de archivo no permitido. Use PDF, DOC, DOCX, TXT, JPG o PNG', 400);
        }

        // Generar nombre único
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = sprintf(
            'submission_%d_%d_%s.%s',
            $studentId,
            $assignmentId,
            date('YmdHis'),
            $extension
        );

        // Directorio de uploads
        $uploadDir = __DIR__ . '/../../uploads/submissions/';
        
        // Crear directorio si no existe
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $uploadPath = $uploadDir . $fileName;

        // Mover archivo
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            errorResponse('Error al guardar el archivo', 500);
        }

        $fileUrl = '/uploads/submissions/' . $fileName;
    }

    // Si no hay archivo y es nueva entrega, error
    if (!$fileUrl && !$existingSubmission) {
        errorResponse('Debes subir un archivo', 400);
    }

    if ($existingSubmission) {
        // Actualizar entrega existente
        $updateData = [
            'comments' => $comments,
            'status' => 'submitted',
            'submitted_at' => date('Y-m-d H:i:s')
        ];

        if ($fileUrl) {
            $updateData['file_url'] = $fileUrl;
        }

        $db->update('submissions', $updateData, 'id = :id', ['id' => $existingSubmission['id']]);
        $submissionId = (int) $existingSubmission['id'];
        $message = 'Tarea actualizada exitosamente';
    } else {
        // Crear nueva entrega
        $submissionId = $db->insert('submissions', [
            'assignment_id' => $assignmentId,
            'student_id' => $studentId,
            'file_url' => $fileUrl,
            'comments' => $comments,
            'status' => 'submitted'
        ]);
        $message = 'Tarea enviada exitosamente';
    }

    // Obtener entrega actualizada
    $submission = $db->fetchOne(
        "SELECT * FROM submissions WHERE id = :id",
        ['id' => $submissionId]
    );

    successResponse([
        'submission' => [
            'id' => $submissionId,
            'assignment_id' => $assignmentId,
            'assignment_title' => $assignment['title'],
            'course_title' => $assignment['course_title'],
            'file_url' => $submission['file_url'],
            'comments' => $submission['comments'],
            'status' => $submission['status'],
            'submitted_at' => $submission['submitted_at']
        ]
    ], $message);

} catch (Exception $e) {
    error_log("Upload Submission Error: " . $e->getMessage());
    errorResponse('Error al procesar la entrega', 500);
}
