-- MyStar programme workflow schema

CREATE TABLE IF NOT EXISTS student_registry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    matric_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    faculty VARCHAR(150) NOT NULL,
    course VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merit_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_level VARCHAR(50) NOT NULL,
    role_type VARCHAR(30) NOT NULL,
    merit_points INT NOT NULL,
    UNIQUE KEY uk_merit_level_role (programme_level, role_type)
);

CREATE TABLE IF NOT EXISTS programme_committee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT NOT NULL,
    student_id BIGINT NULL,
    matric_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    faculty VARCHAR(150) NOT NULL,
    committee_role VARCHAR(50) NOT NULL,
    merit_role_type VARCHAR(30) NOT NULL,
    merit_points INT DEFAULT 0,
    has_campuslink_account BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_committee_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS programme_sdg (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT NOT NULL,
    sdg_number INT NOT NULL,
    UNIQUE KEY uk_programme_sdg (programme_id, sdg_number),
    CONSTRAINT fk_sdg_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS advisor_approval (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT NOT NULL UNIQUE,
    advisor_name VARCHAR(255) NOT NULL,
    advisor_email VARCHAR(255),
    approval_method VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    approval_token VARCHAR(100) UNIQUE,
    remarks TEXT,
    approved_at TIMESTAMP NULL,
    signed_document_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_advisor_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS programme_document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT NOT NULL,
    document_type VARCHAR(40) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT NOT NULL,
    from_status VARCHAR(40),
    to_status VARCHAR(40) NOT NULL,
    action VARCHAR(80) NOT NULL,
    performed_by BIGINT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE
);

-- Extend programme table (ignore errors if columns already exist via Hibernate)
SET @dbname = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'registration_open_date') = 0,
    'ALTER TABLE programme ADD COLUMN registration_open_date DATE NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'registration_close_date') = 0,
    'ALTER TABLE programme ADD COLUMN registration_close_date DATE NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'collaborating_organization') = 0,
    'ALTER TABLE programme ADD COLUMN collaborating_organization VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'sponsorship_info') = 0,
    'ALTER TABLE programme ADD COLUMN sponsorship_info TEXT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'archived_at') = 0,
    'ALTER TABLE programme ADD COLUMN archived_at TIMESTAMP NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'created_at') = 0,
    'ALTER TABLE programme ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'updated_at') = 0,
    'ALTER TABLE programme ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'user' AND COLUMN_NAME = 'faculty') = 0,
    'ALTER TABLE user ADD COLUMN faculty VARCHAR(150) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
