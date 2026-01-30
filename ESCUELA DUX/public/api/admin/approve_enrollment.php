<?php
/**
 * API Endpoint: Approve/Reject Enrollment (Admin)
 * POST /api/admin/approve_enrollment.php
 * 
 * Cambia el status de una inscripción
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
    if (!validateRequired($input, ['enrollment_id', 'status'])) {
        errorResponse('ID de inscripción y status son requeridos', 400);
    }

    $enrollmentId = (int) $input['enrollment_id'];
    $status = sanitize($input['status']);
    $adminId = isset($input['admin_id']) ? (int) $input['admin_id'] : null;
    $notes = isset($input['notes']) ? sanitize($input['notes']) : null;

    // Validar status
    $validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        errorResponse('Status inválido. Use: pending, approved, rejected, cancelled', 400);
    }

    $db = Database::getInstance();

    // Verificar que la inscripción existe
    $enrollment = $db->fetchOne(
        "SELECT e.id, e.status, e.user_id, e.course_id, 
                u.full_name as student_name, u.email as student_email,
                c.title as course_title
         FROM enrollments e
         INNER JOIN users u ON e.user_id = u.id
         INNER JOIN courses c ON e.course_id = c.id
         WHERE e.id = :id",
        ['id' => $enrollmentId]
    );

    if (!$enrollment) {
        errorResponse('Inscripción no encontrada', 404);
    }

    // Preparar datos de actualización
    $updateData = [
        'status' => $status,
        'notes' => $notes
    ];

    // Si se aprueba, agregar datos de aprobación
    if ($status === 'approved') {
        $updateData['approved_at'] = date('Y-m-d H:i:s');
        if ($adminId) {
            $updateData['approved_by'] = $adminId;
        }
    }

    // Actualizar inscripción
    $affected = $db->update('enrollments', $updateData, 'id = :id', ['id' => $enrollmentId]);

    if ($affected === 0) {
        errorResponse('No se pudo actualizar la inscripción', 500);
    }

    // Obtener inscripción actualizada
    $updatedEnrollment = $db->fetchOne(
        "SELECT e.*, u.full_name as student_name, c.title as course_title
         FROM enrollments e
         INNER JOIN users u ON e.user_id = u.id
         INNER JOIN courses c ON e.course_id = c.id
         WHERE e.id = :id",
        ['id' => $enrollmentId]
    );

    $statusMessages = [
        'approved' => 'Inscripción aprobada exitosamente',
        'rejected' => 'Inscripción rechazada',
        'pending' => 'Inscripción marcada como pendiente',
        'cancelled' => 'Inscripción cancelada'
    ];

    successResponse([
        'enrollment' => [
            'id' => (int) $updatedEnrollment['id'],
            'student_name' => $updatedEnrollment['student_name'],
            'course_title' => $updatedEnrollment['course_title'],
            'status' => $updatedEnrollment['status'],
            'approved_at' => $updatedEnrollment['approved_at'],
            'notes' => $updatedEnrollment['notes']
        ]
    ], $statusMessages[$status]);

} catch (Exception $e) {
    error_log("Approve Enrollment Error: " . $e->getMessage());
    errorResponse('Error al procesar la inscripción', 500);
}
