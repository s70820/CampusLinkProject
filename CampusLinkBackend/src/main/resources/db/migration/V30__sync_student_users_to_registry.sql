-- Ensure every STUDENT account in user is represented in student_registry (prototype sync).
-- Preserves existing study_level in registry when the row already exists.

INSERT INTO student_registry (matric_number, full_name, faculty, study_level, is_active)
SELECT
    UPPER(TRIM(u.matric_number)),
    u.full_name,
    COALESCE(NULLIF(TRIM(u.faculty), ''), 'Not Specified'),
    'Degree',
    TRUE
FROM user u
WHERE UPPER(u.role) = 'STUDENT'
  AND u.matric_number IS NOT NULL
  AND TRIM(u.matric_number) <> ''
  AND UPPER(TRIM(u.matric_number)) REGEXP '^S[0-9]{5}$'
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    faculty = VALUES(faculty),
    is_active = TRUE;
