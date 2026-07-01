-- Store applicant-entered club names on role requests (no fixed club picker).

SET @has_rr_club_name = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_request' AND COLUMN_NAME = 'club_name'
);
SET @sql_rr_club_name = IF(
    @has_rr_club_name = 0,
    'ALTER TABLE role_request ADD COLUMN club_name VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt_rr_club_name FROM @sql_rr_club_name;
EXECUTE stmt_rr_club_name;
DEALLOCATE PREPARE stmt_rr_club_name;

UPDATE role_request rr
INNER JOIN club c ON c.id = rr.club_id
SET rr.club_name = c.name
WHERE rr.club_id IS NOT NULL
  AND rr.club_name IS NULL;
