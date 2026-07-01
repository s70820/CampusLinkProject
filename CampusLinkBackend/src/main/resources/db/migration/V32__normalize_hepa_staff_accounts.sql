-- HEPA staff are system administrators: no matric, faculty, or approval workflow.
-- Keep exactly three seeded HEPA accounts with realistic UMT staff names.

DELETE FROM user
WHERE UPPER(role) = 'HEPA'
  AND email NOT IN (
      'hepa.demo@gmail.com',
      'hepa2.demo@gmail.com',
      'hepa3.demo@gmail.com'
  );

UPDATE user
SET matric_number = NULL,
    faculty = NULL,
    approval_status = NULL
WHERE UPPER(role) = 'HEPA';

UPDATE user
SET full_name = 'Norazila binti Ahmad',
    phone_number = '0398765432',
    ic_number = '800101015199'
WHERE email = 'hepa.demo@gmail.com';

INSERT IGNORE INTO user (full_name, email, password_hash, matric_number, role, approval_status, faculty, phone_number, ic_number)
VALUES
    ('Siti Rahayu binti Mohd Zain', 'hepa2.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', NULL, 'HEPA', NULL, NULL, '0398765433', '820215025202'),
    ('Mohd Firdaus bin Hassan', 'hepa3.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', NULL, 'HEPA', NULL, NULL, '0398765434', '850320035303');
