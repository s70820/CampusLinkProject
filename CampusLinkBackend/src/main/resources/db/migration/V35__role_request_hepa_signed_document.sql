-- HEPA-signed club organizer approval form returned to the student on approval.

SET @has_hepa_path = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_request' AND COLUMN_NAME = 'hepa_signed_document_path'
);
SET @sql_hepa_path = IF(
    @has_hepa_path = 0,
    'ALTER TABLE role_request ADD COLUMN hepa_signed_document_path VARCHAR(500) NULL',
    'SELECT 1'
);
PREPARE stmt_hepa_path FROM @sql_hepa_path;
EXECUTE stmt_hepa_path;
DEALLOCATE PREPARE stmt_hepa_path;

SET @has_hepa_name = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_request' AND COLUMN_NAME = 'hepa_signed_document_name'
);
SET @sql_hepa_name = IF(
    @has_hepa_name = 0,
    'ALTER TABLE role_request ADD COLUMN hepa_signed_document_name VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt_hepa_name FROM @sql_hepa_name;
EXECUTE stmt_hepa_name;
DEALLOCATE PREPARE stmt_hepa_name;
