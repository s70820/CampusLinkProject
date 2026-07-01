-- Remove non-student accounts from student_registry and rename HEPA staff.

DELETE sr
FROM student_registry sr
LEFT JOIN user u ON u.matric_number = sr.matric_number
WHERE sr.matric_number = 'S79999'
   OR (u.id IS NOT NULL AND UPPER(u.role) <> 'STUDENT');

UPDATE user
SET full_name = 'Norazila binti Ahmad'
WHERE email = 'hepa.demo@gmail.com';
