-- CampusLink Database Schema
-- MySQL InnoDB Tables

-- =====================================================
-- 1. USER TABLE (Extended)
-- =====================================================
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `matric_number` VARCHAR(50) UNIQUE,
  `ic_number` VARCHAR(20) UNIQUE,
  `phone_number` VARCHAR(20) NOT NULL,
  `faculty` VARCHAR(150),
  `role` ENUM('STUDENT', 'ORGANIZER', 'HEPA', 'ADMIN') DEFAULT 'STUDENT',
  `profile_picture_url` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_ic_number` (`ic_number`),
  INDEX `idx_faculty` (`faculty`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. PROGRAMME TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `programme` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `programme_level` VARCHAR(50),
  `programme_type` VARCHAR(50),
  `venue` VARCHAR(255) NOT NULL,
  `google_maps_link` VARCHAR(255),
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `expected_participants` INT UNSIGNED DEFAULT 0,
  `objectives` LONGTEXT,
  `expected_outcomes` LONGTEXT,
  `organizer_club` VARCHAR(100),
  `poster_path` VARCHAR(255),
  `status` ENUM('DRAFT', 'PENDING_MPP', 'PENDING_HEPA', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'DRAFT',
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY `fk_programme_created_by` (`created_by`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_title` (`title`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_date` (`start_date`),
  INDEX `idx_organizer_club` (`organizer_club`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. PROGRAMME_COMMITTEE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `programme_committee` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `programme_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `matric_number` VARCHAR(50),
  `committee_role` VARCHAR(100) NOT NULL,
  `merit_points` DECIMAL(10, 2) DEFAULT 0.00,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY `fk_committee_programme` (`programme_id`) REFERENCES `programme` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY `fk_committee_student` (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uk_programme_student_role` (`programme_id`, `student_id`, `committee_role`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_committee_role` (`committee_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. PROGRAMME_SDG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `programme_sdg` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `programme_id` INT UNSIGNED NOT NULL,
  `sdg_number` INT UNSIGNED NOT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY `fk_sdg_programme` (`programme_id`) REFERENCES `programme` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uk_programme_sdg` (`programme_id`, `sdg_number`),
  INDEX `idx_sdg_number` (`sdg_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. PROGRAMME_REGISTRATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `programme_registration` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `programme_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `registration_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED') DEFAULT 'PENDING',
  `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_at` TIMESTAMP NULL,
  `approved_by` INT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY `fk_registration_programme` (`programme_id`) REFERENCES `programme` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY `fk_registration_student` (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY `fk_registration_approved_by` (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `uk_programme_student` (`programme_id`, `student_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_registration_status` (`registration_status`),
  INDEX `idx_registered_at` (`registered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. ATTENDANCE_SESSION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `attendance_session` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `programme_id` INT UNSIGNED NOT NULL,
  `qr_token` VARCHAR(255) NOT NULL UNIQUE,
  `start_time` TIMESTAMP NOT NULL,
  `expiry_time` TIMESTAMP NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY `fk_attendance_session_programme` (`programme_id`) REFERENCES `programme` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_qr_token` (`qr_token`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. ATTENDANCE_RECORD TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `attendance_record` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `programme_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `scan_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `attendance_status` ENUM('PRESENT', 'LATE', 'ABSENT') DEFAULT 'PRESENT',
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY `fk_attendance_programme` (`programme_id`) REFERENCES `programme` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY `fk_attendance_student` (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uk_programme_student_attendance` (`programme_id`, `student_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_attendance_status` (`attendance_status`),
  INDEX `idx_scan_time` (`scan_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. MERIT_RECORD TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `merit_record` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `programme_id` INT UNSIGNED NOT NULL,
  `committee_role` VARCHAR(100) NOT NULL,
  `merit_points` DECIMAL(10, 2) NOT NULL,
  `awarded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY `fk_merit_student` (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY `fk_merit_programme` (`programme_id`) REFERENCES `programme` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_programme_id` (`programme_id`),
  INDEX `idx_awarded_at` (`awarded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. GENERATED_CERTIFICATE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `generated_certificate` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `programme_id` INT UNSIGNED NOT NULL,
  `certificate_path` VARCHAR(255) NOT NULL,
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY `fk_certificate_student` (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY `fk_certificate_programme` (`programme_id`) REFERENCES `programme` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uk_student_programme_certificate` (`student_id`, `programme_id`),
  INDEX `idx_programme_id` (`programme_id`),
  INDEX `idx_generated_at` (`generated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
