SET @ddl := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE programme ADD COLUMN draft_expiry_warning_sent_at DATETIME NULL',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'programme'
      AND COLUMN_NAME = 'draft_expiry_warning_sent_at'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
