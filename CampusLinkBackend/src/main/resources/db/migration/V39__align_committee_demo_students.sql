-- Align S70001–S70030 committee demo students with student_registry and CampusLink+ accounts.
-- Fixes matric/name mismatches (e.g. S70002 showing wrong student) and missing faculty values.

-- Restore legacy demo matrics removed when V8 replaced registry (needed for Sarah / older demos).
INSERT INTO student_registry (matric_number, full_name, faculty, study_level, is_active) VALUES
('S70462', 'Sarah Amara', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S70877', 'Muhammad Amirul', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S70846', 'Syed Ali', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S70489', 'Ahmad Ali', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S50908', 'Muhammad Abu', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S70980', 'Safwan Haikal', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    faculty = VALUES(faculty),
    study_level = VALUES(study_level),
    is_active = TRUE;

-- Canonical robotics-workshop committee rows (registry source of truth).
INSERT INTO student_registry (matric_number, full_name, faculty, study_level, is_active) VALUES
('S70001', 'Nur Aisyah binti Abdullah', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S70002', 'Muhammad Hafiz bin Razak', 'Faculty of Computer Science and Mathematics (FSKM)', 'Master', TRUE),
('S70003', 'Tan Wei Lin', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S70004', 'Arvind a/l Subramaniam', 'Faculty of Computer Science and Mathematics (FSKM)', 'PhD', TRUE),
('S70005', 'Siti Nabilah binti Hassan', 'Faculty of Computer Science and Mathematics (FSKM)', 'Diploma', TRUE),
('S70006', 'Lee Jun Wei', 'Faculty of Ocean Engineering Technology (FTKK)', 'Degree', TRUE),
('S70007', 'Nurul Izzati binti Kamal', 'Faculty of Ocean Engineering Technology (FTKK)', 'Foundation', TRUE),
('S70008', 'Rajkumar a/l Muthusamy', 'Faculty of Ocean Engineering Technology (FTKK)', 'Degree', TRUE),
('S70009', 'Ahmad Firdaus bin Yusof', 'Faculty of Ocean Engineering Technology (FTKK)', 'Master', TRUE),
('S70010', 'Wong Kah Yan', 'Faculty of Ocean Engineering Technology (FTKK)', 'Diploma', TRUE),
('S70011', 'Mohd Hakimi bin Sulaiman', 'Faculty of Fisheries and Food Science (FPSM)', 'Degree', TRUE),
('S70012', 'Devi a/p Krishnan', 'Faculty of Fisheries and Food Science (FPSM)', 'Degree', TRUE),
('S70013', 'Ooi Chee Keong', 'Faculty of Fisheries and Food Science (FPSM)', 'Master', TRUE),
('S70014', 'Farah Dyana binti Zakaria', 'Faculty of Fisheries and Food Science (FPSM)', 'Diploma', TRUE),
('S70015', 'Ng Xin Yu', 'Faculty of Fisheries and Food Science (FPSM)', 'Foundation', TRUE),
('S70016', 'Ibrahim bin Musa', 'Faculty of Science and Marine Environment (FSSM)', 'Degree', TRUE),
('S70017', 'Chen Pei Ling', 'Faculty of Science and Marine Environment (FSSM)', 'PhD', TRUE),
('S70018', 'Sharmila a/p Ganesan', 'Faculty of Science and Marine Environment (FSSM)', 'Degree', TRUE),
('S70019', 'Muhd Amirul bin Zulkifli', 'Faculty of Science and Marine Environment (FSSM)', 'Diploma', TRUE),
('S70020', 'Koh Siew Mei', 'Faculty of Science and Marine Environment (FSSM)', 'Master', TRUE),
('S70021', 'Nurul Huda binti Mahmud', 'Faculty of Business, Economics and Social Development (FPEPS)', 'Degree', TRUE),
('S70022', 'Goh Boon Heng', 'Faculty of Business, Economics and Social Development (FPEPS)', 'Degree', TRUE),
('S70023', 'Aisha binti Rahman', 'Faculty of Business, Economics and Social Development (FPEPS)', 'Foundation', TRUE),
('S70024', 'Thinesh a/l Velu', 'Faculty of Business, Economics and Social Development (FPEPS)', 'Diploma', TRUE),
('S70025', 'Zarith Sofia binti Karim', 'Faculty of Business, Economics and Social Development (FPEPS)', 'Master', TRUE),
('S70026', 'Muhammad Alif bin Rosli', 'Faculty of Maritime Studies (FPM)', 'Degree', TRUE),
('S70027', 'Yap Jia Min', 'Faculty of Maritime Studies (FPM)', 'Degree', TRUE),
('S70028', 'Logeswari a/p Ramasamy', 'Faculty of Maritime Studies (FPM)', 'Diploma', TRUE),
('S70029', 'Haziq bin Mohd Nor', 'Faculty of Maritime Studies (FPM)', 'Master', TRUE),
('S70030', 'Lim Zhi Yang', 'Faculty of Maritime Studies (FPM)', 'Degree', TRUE)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    faculty = VALUES(faculty),
    study_level = VALUES(study_level),
    is_active = TRUE;

-- If Safwan (or another legacy demo) was wrongly assigned S70002, move back to S70980.
UPDATE user
SET matric_number = 'S70980',
    full_name = 'Safwan Haikal',
    faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    email = CASE
        WHEN email IS NULL OR TRIM(email) = '' OR email LIKE '%@ocean.umt.edu.my' THEN 'safwan.demo@gmail.com'
        ELSE email
    END
WHERE UPPER(matric_number) = 'S70002'
  AND (
    full_name LIKE '%Safwan%'
    OR full_name LIKE '%Haikal%'
    OR email LIKE '%safwan%'
  );

-- Sync every student account name/faculty from registry when matric matches.
UPDATE user u
INNER JOIN student_registry sr ON UPPER(sr.matric_number) = UPPER(u.matric_number)
SET u.full_name = sr.full_name,
    u.faculty = sr.faculty
WHERE UPPER(u.role) = 'STUDENT'
  AND sr.is_active = TRUE;

-- Back-fill faculty on any remaining student rows (including legacy matrics).
UPDATE user u
INNER JOIN student_registry sr ON UPPER(sr.matric_number) = UPPER(u.matric_number)
SET u.faculty = sr.faculty
WHERE UPPER(u.role) = 'STUDENT'
  AND (
    u.faculty IS NULL
    OR TRIM(u.faculty) = ''
    OR u.faculty = 'Not Specified'
  );

UPDATE user
SET faculty = 'Faculty of Computer Science and Mathematics (FSKM)'
WHERE UPPER(role) = 'STUDENT'
  AND (faculty IS NULL OR TRIM(faculty) = '' OR faculty = 'Not Specified')
  AND matric_number IN ('S70462', 'S70877', 'S70846', 'S70489', 'S50908', 'S70980');

UPDATE student_registry
SET faculty = 'Faculty of Computer Science and Mathematics (FSKM)'
WHERE faculty IS NULL OR TRIM(faculty) = '' OR faculty = 'Not Specified';

-- Create CampusLink+ student accounts for S70001–S70030 (password: demo123 via bootstrap hash).
INSERT IGNORE INTO user (full_name, email, password_hash, matric_number, role, approval_status, faculty, phone_number, ic_number)
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
WHERE sr.matric_number REGEXP '^S700[0-9]{2}$'
  AND sr.is_active = TRUE;

-- Ensure robotics-workshop committee matrics resolve to registry names after any prior inserts.
UPDATE user u
INNER JOIN student_registry sr ON UPPER(sr.matric_number) = UPPER(u.matric_number)
SET u.full_name = sr.full_name,
    u.faculty = sr.faculty,
    u.role = 'STUDENT',
    u.approval_status = 'APPROVED'
WHERE UPPER(u.matric_number) IN ('S70002', 'S70003', 'S70004', 'S70005', 'S70462');
