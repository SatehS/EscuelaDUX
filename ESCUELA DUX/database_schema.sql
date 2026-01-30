-- ============================================
-- ESCUELA DUX - Database Schema
-- Base de datos: david_escuelaDux
-- Autor: Senior LAMP Stack Architect
-- Fecha: 2026-01-30
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================
-- TABLA: roles
-- Roles de usuario del sistema
-- ============================================
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: users
-- Usuarios del sistema (admins, profesores, estudiantes)
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `country` VARCHAR(100) DEFAULT NULL,
    `avatar_url` VARCHAR(500) DEFAULT NULL,
    `role_id` INT UNSIGNED NOT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `last_login` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role_id`),
    CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: courses
-- Cursos/Talleres disponibles
-- ============================================
CREATE TABLE IF NOT EXISTS `courses` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `teacher_id` INT UNSIGNED DEFAULT NULL,
    `schedule_days` VARCHAR(100) DEFAULT NULL,
    `schedule_time` VARCHAR(100) DEFAULT NULL,
    `shift` ENUM('morning', 'afternoon', 'night') DEFAULT 'night',
    `total_classes` INT UNSIGNED DEFAULT 8,
    `total_hours` INT UNSIGNED DEFAULT 16,
    `price_cop` DECIMAL(12,2) DEFAULT NULL,
    `price_usd` DECIMAL(10,2) DEFAULT NULL,
    `image_url` VARCHAR(500) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `modality` ENUM('online', 'presencial', 'hybrid') DEFAULT 'online',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_teacher` (`teacher_id`),
    CONSTRAINT `fk_courses_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: enrollments
-- Inscripciones de estudiantes a cursos
-- ============================================
CREATE TABLE IF NOT EXISTS `enrollments` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `course_id` INT UNSIGNED NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `payment_proof_url` VARCHAR(500) DEFAULT NULL,
    `amount_paid` DECIMAL(12,2) DEFAULT NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    `approved_by` INT UNSIGNED DEFAULT NULL,
    `approved_at` TIMESTAMP NULL DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_course` (`course_id`),
    INDEX `idx_status` (`status`),
    UNIQUE KEY `unique_enrollment` (`user_id`, `course_id`),
    CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_enrollments_approver` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: assignments
-- Tareas asignadas por profesores
-- ============================================
CREATE TABLE IF NOT EXISTS `assignments` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `course_id` INT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `due_date` DATE DEFAULT NULL,
    `file_url` VARCHAR(500) DEFAULT NULL,
    `max_grade` DECIMAL(5,2) DEFAULT 100.00,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_by` INT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_course` (`course_id`),
    INDEX `idx_due_date` (`due_date`),
    CONSTRAINT `fk_assignments_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_assignments_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: submissions
-- Entregas de tareas por estudiantes
-- ============================================
CREATE TABLE IF NOT EXISTS `submissions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `assignment_id` INT UNSIGNED NOT NULL,
    `student_id` INT UNSIGNED NOT NULL,
    `file_url` VARCHAR(500) DEFAULT NULL,
    `comments` TEXT DEFAULT NULL,
    `grade` DECIMAL(5,2) DEFAULT NULL,
    `feedback` TEXT DEFAULT NULL,
    `graded_by` INT UNSIGNED DEFAULT NULL,
    `graded_at` TIMESTAMP NULL DEFAULT NULL,
    `status` ENUM('submitted', 'graded', 'returned') DEFAULT 'submitted',
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_assignment` (`assignment_id`),
    INDEX `idx_student` (`student_id`),
    UNIQUE KEY `unique_submission` (`assignment_id`, `student_id`),
    CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_submissions_student` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_submissions_grader` FOREIGN KEY (`graded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: class_recordings
-- Clases grabadas
-- ============================================
CREATE TABLE IF NOT EXISTS `class_recordings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `course_id` INT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `video_url` VARCHAR(500) NOT NULL,
    `duration_minutes` INT UNSIGNED DEFAULT NULL,
    `class_number` INT UNSIGNED DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_course` (`course_id`),
    CONSTRAINT `fk_recordings_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: course_materials
-- Material escrito del curso
-- ============================================
CREATE TABLE IF NOT EXISTS `course_materials` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `course_id` INT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(50) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_course` (`course_id`),
    CONSTRAINT `fk_materials_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERTS INICIALES: Roles
-- ============================================
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Administrador del sistema con acceso total'),
(2, 'teacher', 'Profesor con acceso a gestión de cursos y alumnos'),
(3, 'student', 'Estudiante con acceso a cursos inscritos');

-- ============================================
-- INSERTS INICIALES: Usuario Admin
-- Password: 1234 (hash generado con password_hash())
-- ============================================
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role_id`) VALUES
(1, 'Administrador DUX', 'admin@dux.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- ============================================
-- INSERTS INICIALES: Profesores
-- Password: 1234
-- ============================================
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role_id`) VALUES
(2, 'Carolina Eguiguren', 'carolina@dux.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(3, 'Hexy Marquez', 'hexy@dux.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(4, 'José Alí Cabrera', 'jose@dux.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2);

-- ============================================
-- INSERTS INICIALES: Estudiante de prueba
-- Password: 1234
-- ============================================
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role_id`) VALUES
(5, 'Estudiante Demo', 'alumno@dux.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3);

-- ============================================
-- INSERTS INICIALES: Cursos Base
-- ============================================
INSERT INTO `courses` (`id`, `title`, `description`, `teacher_id`, `schedule_days`, `schedule_time`, `shift`, `total_classes`, `total_hours`, `price_cop`, `modality`) VALUES
(1, 'Escritura Creativa', 'Aprende a desarrollar tu creatividad literaria y técnicas de escritura para crear historias cautivadoras.', 2, 'Lunes y Miércoles', '6:00 pm a 8:00 pm', 'night', 8, 16, 200000.00, 'online'),
(2, 'Edición y Corrección de Estilo', 'Domina las técnicas de edición profesional y corrección de estilo para textos literarios y comerciales.', 2, 'Martes y Jueves', '6:00 pm a 8:00 pm', 'night', 8, 16, 200000.00, 'online'),
(3, 'Redacción', 'Mejora tus habilidades de redacción para comunicar ideas de forma clara, precisa y efectiva.', 3, 'Martes y Jueves', '6:00 pm a 8:00 pm', 'night', 8, 16, 180000.00, 'online'),
(4, 'Narración', 'Desarrolla técnicas narrativas para contar historias que cautiven a tu audiencia.', 3, 'Martes y Jueves', '6:00 pm a 8:00 pm', 'night', 8, 16, 180000.00, 'online'),
(5, 'Dicción, Voz y Oratoria', 'Perfecciona tu dicción, proyección de voz y habilidades de oratoria para comunicar con impacto.', 4, 'Martes y Jueves', '8:00 pm a 10:00 pm', 'night', 8, 16, 220000.00, 'online'),
(6, 'Lector Editorial', 'Conviértete en lector editorial profesional y aprende a evaluar manuscritos para el mercado editorial.', 2, 'Sábados', '9:00 am a 11:00 am', 'morning', 8, 16, 250000.00, 'online'),
(7, 'Escritura Creativa Presencial', 'Taller intensivo presencial de escritura creativa con práctica en vivo.', 2, 'Sábados', '8:00 am a 12:00 m', 'morning', 4, 16, 300000.00, 'presencial');

-- ============================================
-- INSERT: Inscripción de prueba (estudiante demo en Escritura Creativa)
-- ============================================
INSERT INTO `enrollments` (`user_id`, `course_id`, `payment_method`, `status`, `approved_by`, `approved_at`) VALUES
(5, 1, 'transferencia', 'approved', 1, NOW());

-- ============================================
-- INSERT: Clases grabadas de ejemplo
-- ============================================
INSERT INTO `class_recordings` (`course_id`, `title`, `video_url`, `class_number`) VALUES
(1, 'Clase 1: Introducción a la Escritura Creativa', 'https://www.youtube.com/embed/ysz5S6PUM-U', 1),
(1, 'Clase 2: Técnicas de Escritura', 'https://www.youtube.com/embed/jfKfPfyJRdk', 2),
(1, 'Clase 3: Narración Creativa', 'https://www.youtube.com/embed/2Vv-BfVoq4g', 3);

-- ============================================
-- INSERT: Tareas de ejemplo
-- ============================================
INSERT INTO `assignments` (`course_id`, `title`, `description`, `due_date`, `created_by`) VALUES
(1, 'Cuento Corto #1', 'Escribe un cuento corto de máximo 1000 palabras sobre el tema: "Un encuentro inesperado".', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 2),
(1, 'Ejercicio de Diálogos', 'Crea una escena de diálogo entre dos personajes con conflicto interno.', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 2);

COMMIT;
