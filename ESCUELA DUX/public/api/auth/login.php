<?php
/**
 * API Endpoint: Login
 * POST /api/auth/login.php
 * 
 * Autentica usuario y retorna datos de sesión
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
    if (!validateRequired($input, ['email', 'password'])) {
        errorResponse('Email y contraseña son requeridos', 400);
    }

    $email = sanitize(strtolower($input['email']));
    $password = $input['password'];

    // Validar formato de email
    if (!isValidEmail($email)) {
        errorResponse('Formato de email inválido', 400);
    }

    // Buscar usuario en la base de datos
    $db = Database::getInstance();
    
    $sql = "SELECT u.id, u.full_name, u.email, u.password_hash, u.phone, 
                   u.avatar_url, u.is_active, r.id as role_id, r.name as role_name
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE u.email = :email
            LIMIT 1";
    
    $user = $db->fetchOne($sql, ['email' => $email]);

    // Verificar si el usuario existe
    if (!$user) {
        errorResponse('Credenciales incorrectas', 401);
    }

    // Verificar si el usuario está activo
    if (!$user['is_active']) {
        errorResponse('Tu cuenta está desactivada. Contacta al administrador.', 403);
    }

    // Verificar contraseña
    if (!password_verify($password, $user['password_hash'])) {
        errorResponse('Credenciales incorrectas', 401);
    }

    // Actualizar último login
    $db->update('users', 
        ['last_login' => date('Y-m-d H:i:s')], 
        'id = :id', 
        ['id' => $user['id']]
    );

    // Preparar datos de respuesta (sin password_hash)
    $userData = [
        'id' => (int) $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'avatar_url' => $user['avatar_url'],
        'role' => [
            'id' => (int) $user['role_id'],
            'name' => $user['role_name']
        ]
    ];

    // Generar token simple (en producción usar JWT)
    $token = bin2hex(random_bytes(32));
    
    // En una implementación real, guardar el token en la BD o usar JWT
    // Por ahora, enviamos el token como identificador de sesión
    
    successResponse([
        'user' => $userData,
        'token' => $token
    ], 'Inicio de sesión exitoso');

} catch (Exception $e) {
    error_log("Login Error: " . $e->getMessage());
    errorResponse('Error en el servidor', 500);
}
