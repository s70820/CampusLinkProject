SET @dbname = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'position_label') = 0,
    'ALTER TABLE programme_committee ADD COLUMN position_label VARCHAR(150) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'contribution_description') = 0,
    'ALTER TABLE programme_committee ADD COLUMN contribution_description VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
