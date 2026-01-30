<?php
/**
 * API Endpoint: Register (Inscripción)
 * POST /api/auth/register.php
 * 
 * Registra nuevo estudiante e inscribe a un curso
 */

require_once __DIR__ . '/../config/db.php';

setupHeaders();

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método no permitido', 405);
}

try {
    // Obtener datos del body
    $input = getJsonInput();
    
    // Validar campos requeridos
    $required = ['full_name', 'email', 'password', 'course_id'];
    if (!validateRequired($input, $required)) {
        errorResponse('Nombre, email, contraseña y curso son requeridos', 400);
    }

    // Sanitizar datos
    $fullName = sanitize($input['full_name']);
    $email = sanitize(strtolower($input['email']));
    $password = $input['password'];
    $courseId = (int) $input['course_id'];
    $phone = isset($input['phone']) ? sanitize($input['phone']) : null;
    $country = isset($input['country']) ? sanitize($input['country']) : null;
    $paymentMethod = isset($input['payment_method']) ? sanitize($input['payment_method']) : null;

    // Validaciones
    if (!isValidEmail($email)) {
        errorResponse('Formato de email inválido', 400);
    }

    if (strlen($password) < 4) {
        errorResponse('La contraseña debe tener al menos 4 caracteres', 400);
    }

    if (strlen($fullName) < 3) {
        errorResponse('El nombre debe tener al menos 3 caracteres', 400);
    }

    $db = Database::getInstance();

    // Verificar si el email ya existe
    $existingUser = $db->fetchOne(
        "SELECT id FROM users WHERE email = :email",
        ['email' => $email]
    );

    if ($existingUser) {
        errorResponse('Este email ya está registrado', 409);
    }

    // Verificar si el curso existe y está activo
    $course = $db->fetchOne(
        "SELECT id, title FROM courses WHERE id = :id AND is_active = 1",
        ['id' => $courseId]
    );

    if (!$course) {
        errorResponse('El curso seleccionado no existe o no está disponible', 404);
    }

    // Iniciar transacción
    $db->beginTransaction();

    try {
        // Crear usuario con rol de estudiante (role_id = 3)
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $userId = $db->insert('users', [
            'full_name' => $fullName,
            'email' => $email,
            'password_hash' => $passwordHash,
            'phone' => $phone,
            'country' => $country,
            'role_id' => 3 // student
        ]);

        // Crear inscripción con status 'pending'
        $enrollmentId = $db->insert('enrollments', [
            'user_id' => $userId,
            'course_id' => $courseId,
            'payment_method' => $paymentMethod,
            'status' => 'pending'
        ]);

        // Confirmar transacción
        $db->commit();

        // Preparar respuesta
        $userData = [
            'id' => $userId,
            'full_name' => $fullName,
            'email' => $email,
            'role' => [
                'id' => 3,
                'name' => 'student'
            ]
        ];

        $enrollmentData = [
            'id' => $enrollmentId,
            'course' => $course['title'],
            'status' => 'pending'
        ];

        successResponse([
            'user' => $userData,
            'enrollment' => $enrollmentData
        ], 'Registro exitoso. Tu inscripción está pendiente de aprobación.');

    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Register Error: " . $e->getMessage());
    errorResponse('Error al procesar el registro', 500);
}
