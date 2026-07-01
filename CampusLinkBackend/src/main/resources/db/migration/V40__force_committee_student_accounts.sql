-- Force-create committee demo CampusLink+ accounts (idempotent).
-- Handles legacy rows where s70002.demo@gmail.com exists but matric was wrong.

UPDATE user u
INNER JOIN student_registry sr ON UPPER(sr.matric_number) = 'S70002'
SET u.matric_number = 'S70002',
    u.full_name = sr.full_name,
    u.faculty = sr.faculty,
    u.role = 'STUDENT',
    u.approval_status = 'APPROVED'
WHERE LOWER(TRIM(u.email)) = 's70002.demo@gmail.com';

UPDATE user
SET matric_number = 'S70980',
    full_name = 'Safwan Haikal',
    faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    email = 'safwan.demo@gmail.com'
WHERE UPPER(matric_number) = 'S70002'
  AND UPPER(COALESCE(full_name, '')) NOT LIKE '%MUHAMMAD HAFIZ%'
  AND LOWER(TRIM(COALESCE(email, ''))) <> 's70002.demo@gmail.com';

INSERT INTO user (full_name, email, password_hash, matric_number, role, approval_status, faculty, phone_number, ic_number)
SELECT
    sr.full_name,
    CONCAT(LOWER(sr.matric_number), '.demo@gmail.com'),
    '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW',
    sr.matric_number,
    'STUDENT',
    'APPROVED',
    sr.faculty,
    CONCAT('01', SUBSTRING(sr.matric_number, 3, 5)),
    CONCAT(SUBSTRING(sr.matric_number, 2, 5), '010150', SUBSTRING(sr.matric_number, 7, 1))
FROM student_registry sr
WHERE UPPER(sr.matric_number) IN ('S70002', 'S70003', 'S70004', 'S70005', 'S70462')
  AND NOT EXISTS (
    SELECT 1 FROM user u WHERE UPPER(u.matric_number) = UPPER(sr.matric_number)
  )
  AND NOT EXISTS (
    SELECT 1 FROM user u WHERE LOWER(TRIM(u.email)) = CONCAT(LOWER(sr.matric_number), '.demo@gmail.com')
  );

UPDATE user u
INNER JOIN student_registry sr ON UPPER(sr.matric_number) = UPPER(u.matric_number)
SET u.full_name = sr.full_name,
    u.faculty = sr.faculty,
    u.role = 'STUDENT',
    u.approval_status = 'APPROVED'
WHERE UPPER(u.matric_number) IN ('S70002', 'S70003', 'S70004', 'S70005', 'S70462');
