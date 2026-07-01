-- Certificate mode and advisor signature for system-generated participation certificates.

SET @has_certificate_mode = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'certificate_mode'
);
SET @sql_certificate_mode = IF(
    @has_certificate_mode = 0,
    "ALTER TABLE programme ADD COLUMN certificate_mode VARCHAR(20) NOT NULL DEFAULT 'SYSTEM'",
    'SELECT 1'
);
PREPARE stmt_certificate_mode FROM @sql_certificate_mode;
EXECUTE stmt_certificate_mode;
DEALLOCATE PREPARE stmt_certificate_mode;

SET @has_advisor_signature = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'programme' AND COLUMN_NAME = 'advisor_signature_path'
);
SET @sql_advisor_signature = IF(
    @has_advisor_signature = 0,
    'ALTER TABLE programme ADD COLUMN advisor_signature_path VARCHAR(500) NULL',
    'SELECT 1'
);
PREPARE stmt_advisor_signature FROM @sql_advisor_signature;
EXECUTE stmt_advisor_signature;
DEALLOCATE PREPARE stmt_advisor_signature;

UPDATE programme SET certificate_mode = 'SYSTEM' WHERE certificate_mode IS NULL OR TRIM(certificate_mode) = '';
