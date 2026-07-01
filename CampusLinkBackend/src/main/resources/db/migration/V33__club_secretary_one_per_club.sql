-- One approved club secretary (organizer) per club.
-- Idempotent: safe if a previous run partially applied this migration.

CREATE TABLE IF NOT EXISTS club (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    secretary_user_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_club_secretary FOREIGN KEY (secretary_user_id) REFERENCES user(id) ON DELETE SET NULL
);

INSERT INTO club (name) VALUES
    ('Persatuan Mahasiswa FSKM'),
    ('Persatuan Mahasiswa FTKK'),
    ('Persatuan Mahasiswa FPSM'),
    ('Kelab Sukarelawan UMT'),
    ('Kelab Keusahawanan UMT'),
    ('Kelab Sukan dan Rekreasi'),
    ('Kelab E-Sports UMT'),
    ('Robotics & AI Club')
ON DUPLICATE KEY UPDATE name = VALUES(name);

SET @has_user_club_id = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'club_id'
);
SET @sql_user_club_id = IF(
    @has_user_club_id = 0,
    'ALTER TABLE user ADD COLUMN club_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt_user_club_id FROM @sql_user_club_id;
EXECUTE stmt_user_club_id;
DEALLOCATE PREPARE stmt_user_club_id;

SET @has_fk_user_club = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND CONSTRAINT_NAME = 'fk_user_club'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql_fk_user_club = IF(
    @has_fk_user_club = 0,
    'ALTER TABLE user ADD CONSTRAINT fk_user_club FOREIGN KEY (club_id) REFERENCES club(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt_fk_user_club FROM @sql_fk_user_club;
EXECUTE stmt_fk_user_club;
DEALLOCATE PREPARE stmt_fk_user_club;

SET @has_rr_club_id = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_request' AND COLUMN_NAME = 'club_id'
);
SET @sql_rr_club_id = IF(
    @has_rr_club_id = 0,
    'ALTER TABLE role_request ADD COLUMN club_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt_rr_club_id FROM @sql_rr_club_id;
EXECUTE stmt_rr_club_id;
DEALLOCATE PREPARE stmt_rr_club_id;

SET @has_fk_rr_club = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'role_request'
      AND CONSTRAINT_NAME = 'fk_role_request_club'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql_fk_rr_club = IF(
    @has_fk_rr_club = 0,
    'ALTER TABLE role_request ADD CONSTRAINT fk_role_request_club FOREIGN KEY (club_id) REFERENCES club(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt_fk_rr_club FROM @sql_fk_rr_club;
EXECUTE stmt_fk_rr_club;
DEALLOCATE PREPARE stmt_fk_rr_club;

UPDATE user u
INNER JOIN club c ON TRIM(c.name) = TRIM(u.club_name)
SET u.club_id = c.id
WHERE UPPER(u.role) = 'ORGANIZER'
  AND u.club_name IS NOT NULL
  AND u.club_id IS NULL;

UPDATE club c
INNER JOIN user u ON u.club_id = c.id
SET c.secretary_user_id = u.id
WHERE UPPER(u.role) = 'ORGANIZER'
  AND UPPER(u.approval_status) = 'APPROVED'
  AND (c.secretary_user_id IS NULL OR c.secretary_user_id <> u.id);

UPDATE user
SET role = 'STUDENT',
    approval_status = 'APPROVED',
    club_name = NULL,
    club_id = NULL
WHERE UPPER(role) = 'ORGANIZER'
  AND club_id IS NULL;

SET @has_idx_user_club_id = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND INDEX_NAME = 'idx_user_club_id'
);
SET @sql_idx_user_club_id = IF(
    @has_idx_user_club_id = 0,
    'CREATE INDEX idx_user_club_id ON user(club_id)',
    'SELECT 1'
);
PREPARE stmt_idx_user_club_id FROM @sql_idx_user_club_id;
EXECUTE stmt_idx_user_club_id;
DEALLOCATE PREPARE stmt_idx_user_club_id;

SET @has_idx_rr_club_id = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_request' AND INDEX_NAME = 'idx_role_request_club_id'
);
SET @sql_idx_rr_club_id = IF(
    @has_idx_rr_club_id = 0,
    'CREATE INDEX idx_role_request_club_id ON role_request(club_id)',
    'SELECT 1'
);
PREPARE stmt_idx_rr_club_id FROM @sql_idx_rr_club_id;
EXECUTE stmt_idx_rr_club_id;
DEALLOCATE PREPARE stmt_idx_rr_club_id;
