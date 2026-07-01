-- Realistic participant volumes, attendance, merit, and extra programmes for FYP demo.
-- Expands the student pool (S70101–S70180) and fills completed / upcoming programmes
-- to plausible levels relative to expected_participants caps.

-- ========== 1. Additional demo students (registry + accounts) ==========
INSERT INTO student_registry (matric_number, full_name, faculty, study_level, is_active)
SELECT
    CONCAT('S701', LPAD(n.seq, 2, '0')) AS matric_number,
    CONCAT(
        ELT(1 + (n.seq % 8), 'Ahmad', 'Siti', 'Muhammad', 'Nur', 'Lee', 'Tan', 'Raj', 'Wong'),
        ' ',
        ELT(1 + ((n.seq * 3) % 8), 'Hassan', 'Abdullah', 'Ibrahim', 'Lim', 'Kumar', 'Ng', 'Ooi', 'Zainal'),
        ' (Demo)'
    ) AS full_name,
    ELT(1 + (n.seq % 7),
        'Faculty of Computer Science and Mathematics (FSKM)',
        'Faculty of Ocean Engineering Technology (FTKK)',
        'Faculty of Fisheries and Food Science (FPSM)',
        'Faculty of Science and Marine Environment (FSSM)',
        'Faculty of Business, Economics and Social Development (FPEPS)',
        'Faculty of Maritime Studies (FPM)',
        'Faculty of Food Science and Agrotechnology (FSMA)'
    ) AS faculty,
    ELT(1 + (n.seq % 4), 'Degree', 'Diploma', 'Master', 'Foundation') AS study_level,
    TRUE
FROM (
    SELECT ones.n + tens.n * 10 AS seq
    FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) ones
    CROSS JOIN (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) tens
    WHERE ones.n + tens.n * 10 BETWEEN 1 AND 80
) n
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    faculty = VALUES(faculty),
    study_level = VALUES(study_level),
    is_active = TRUE;

INSERT IGNORE INTO user (full_name, email, password_hash, matric_number, role, approval_status, faculty, phone_number, ic_number)
SELECT
    sr.full_name,
    CONCAT(LOWER(sr.matric_number), '.demo@gmail.com'),
    '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW',
    sr.matric_number,
    'STUDENT',
    'APPROVED',
    sr.faculty,
    CONCAT('01', SUBSTRING(sr.matric_number, 3, 6)),
    CONCAT('0', SUBSTRING(sr.matric_number, 2, 5), '010150', RIGHT(sr.matric_number, 1))
FROM student_registry sr
WHERE sr.matric_number REGEXP '^S701[0-9]{2}$'
  AND sr.is_active = TRUE;

-- ========== 2. Extra programmes (completed + upcoming + pending) ==========
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info,
    completed_at
)
SELECT
    'Bengkel Robot Line Follower FSKM 2026',
    'Bengkel membina robot line follower menggunakan sensor IR dan Arduino. Peserta membentuk pasukan kecil dan menyertai pusingan akhir pada hari kedua.',
    'Career', 'Faculty/Club', 'Physical', u.club_name,
    'Memperkenalkan konsep navigasi autonomi asas pada robot mudah alih.',
    'Sekurang-kurangnya 40 pasukan menghasilkan robot line follower berfungsi.',
    'Makmal Robotik FSKM', '2026-05-15', '2026-05-16', '08:30:00', '17:00:00', 50,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    6, 'COMPLETED', 'APPROVED', 'APPROVED', '2026-04-10', '2026-05-10', u.id,
    'CAMPUSLINK_DEMO_V52', '2026-05-18 16:00:00'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Bengkel Robot Line Follower FSKM 2026');

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info,
    communication_link
)
SELECT
    'Kompetisi Mini Sumo Robot FSKM 2026',
    'Pertandingan mini sumo robot terbuka kepada pelajar FSKM. Pasukan 2–3 orang membina robot dalam lingkungan 500g.',
    'Sports', 'Faculty/Club', 'Physical', u.club_name,
    'Mempromosikan reka bentuk mekanikal dan strategi robot sumo.',
    'Minimum 16 pasukan bertanding dalam pusingan kalah mati.',
    'Dewan Serbaguna FSKM', '2026-10-24', '2026-10-25', '09:00:00', '18:00:00', 64,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    8, 'APPROVED', 'APPROVED', 'APPROVED', '2026-08-15', '2026-10-18', u.id,
    'CAMPUSLINK_DEMO_V52', 'https://chat.whatsapp.com/demo-robotics-sumo'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Kompetisi Mini Sumo Robot FSKM 2026');

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'Kursus Penyediaan Pasukan RoboCup Malaysia',
    'Kursus intensif persediaan pasukan UMT untuk pertandingan RoboCup Malaysia — strategi, dokumentasi, dan latihan simulasi.',
    'Career', 'University', 'Hybrid', u.club_name,
    'Menyediakan pasukan UMT untuk pertandingan robotik peringkat kebangsaan.',
    'Pasukan UMT melengkapkan dokumentasi dan prototaip percubaan.',
    'Makmal Robotik FSKM', '2026-11-15', '2026-11-17', '09:00:00', '17:00:00', 40,
    'https://images.unsplash.com/photo-1532094344004-09fa9d4dc63d?auto=format&fit=crop&w=900&q=80',
    10, 'PENDING_MPP_REVIEW', 'PENDING', 'PENDING', '2026-09-01', '2026-11-08', u.id,
    'CAMPUSLINK_DEMO_V52'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Kursus Penyediaan Pasukan RoboCup Malaysia');

-- ========== 3. Registrations — completed programmes (high fill) ==========
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE',
       DATE_SUB(p.start_date, INTERVAL (8 + (u.id % 12)) DAY) + INTERVAL (u.id % 8) HOUR
FROM programme p
INNER JOIN user u ON UPPER(u.role) = 'STUDENT'
WHERE p.status = 'COMPLETED'
  AND p.title IN (
    'Kemahiran Kepimpinan PRS UMT 2026',
    'Simposium Inovasi Pelajar FSKM 2026',
    'ASEAN Youth Leadership Summit UMT 2026',
    'Kejohanan Debat Antara Universiti Peringkat Kebangsaan',
    'Pengenalan Arduino & Sensor Robotik 2026',
    'Bengkel Robot Line Follower FSKM 2026'
  )
  AND (
    u.matric_number REGEXP '^(S700[0-9]{2}|S701[0-9]{2})$'
    OR u.matric_number IN ('S70462', 'S70877', 'S70846', 'S70489', 'S50908', 'S70980')
  )
  AND (
    (p.title = 'Kemahiran Kepimpinan PRS UMT 2026' AND (u.id % 5) <> 0)
    OR (p.title = 'Simposium Inovasi Pelajar FSKM 2026' AND (u.id % 4) <> 0)
    OR (p.title = 'ASEAN Youth Leadership Summit UMT 2026' AND (u.id % 3) = 0)
    OR (p.title = 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan' AND (u.id % 6) IN (0, 1, 2))
    OR (p.title = 'Pengenalan Arduino & Sensor Robotik 2026' AND (u.id % 4) IN (0, 1, 2))
    OR (p.title = 'Bengkel Robot Line Follower FSKM 2026' AND (u.id % 5) IN (0, 1, 2, 3))
  )
  AND NOT EXISTS (
    SELECT 1 FROM programme_registration r
    WHERE r.programme_id = p.id AND r.user_id = u.id
  );

-- ========== 4. Registrations — upcoming / open programmes ==========
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-06-20 10:00:00' + INTERVAL (u.id % 48) HOUR
FROM programme p
INNER JOIN user u ON UPPER(u.role) = 'STUDENT'
WHERE p.status = 'APPROVED'
  AND p.title IN (
    'Bootcamp Visi Komputer untuk Robotik',
    'Bengkel Robotik Lanjutan',
    'Karnival Keusahawanan Siswazah Terengganu 2026',
    'Karnival Sukan Inter-Fakulti UMT 2026',
    'Festival Seni dan Budaya Malaysia UMT 2026',
    'Program Khidmat Masyarakat Negeri Terengganu',
    'Bengkel Kemahiran Industri 4.0 FSKM',
    'Kompetisi Mini Sumo Robot FSKM 2026',
    'Bengkel Kemahiran Industri 4.0 FSKM'
  )
  AND (
    u.matric_number REGEXP '^(S700[0-9]{2}|S701[0-9]{2})$'
    OR u.matric_number IN ('S70462', 'S70877', 'S70846', 'S70489', 'S50908', 'S70980')
  )
  AND (
    (p.title = 'Bootcamp Visi Komputer untuk Robotik' AND (u.id % 3) <> 2)
    OR (p.title = 'Bengkel Robotik Lanjutan' AND (u.id % 4) IN (0, 1, 2))
    OR (p.title = 'Karnival Keusahawanan Siswazah Terengganu 2026' AND (u.id % 3) <> 2)
    OR (p.title = 'Karnival Sukan Inter-Fakulti UMT 2026' AND (u.id % 2) = 0)
    OR (p.title = 'Festival Seni dan Budaya Malaysia UMT 2026' AND (u.id % 3) = 0)
    OR (p.title = 'Program Khidmat Masyarakat Negeri Terengganu' AND (u.id % 4) IN (0, 1, 2))
    OR (p.title = 'Bengkel Kemahiran Industri 4.0 FSKM' AND (u.id % 5) IN (0, 1, 2, 3))
    OR (p.title = 'Kompetisi Mini Sumo Robot FSKM 2026' AND (u.id % 4) IN (0, 1, 2))
  )
  AND NOT EXISTS (
    SELECT 1 FROM programme_registration r
    WHERE r.programme_id = p.id AND r.user_id = u.id
  );

-- Paid workshop: payment references for a subset
UPDATE programme_registration r
INNER JOIN programme p ON p.id = r.programme_id
INNER JOIN user u ON u.id = r.user_id
SET r.status = 'ACTIVE',
    r.payment_reference = CONCAT('RobotikLanjutan_', u.matric_number)
WHERE p.title = 'Bengkel Robotik Lanjutan'
  AND r.payment_reference IS NULL
  AND (u.id % 2) = 0;

-- ========== 5. Attendance — completed programmes ==========
INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, r.user_id, s.session_label, 'PRESENT', s.checked_in_at
FROM programme p
INNER JOIN programme_registration r ON r.programme_id = p.id AND r.status = 'ACTIVE'
INNER JOIN (
    SELECT 'Kemahiran Kepimpinan PRS UMT 2026' AS title, 'Day 1 Opening' AS session_label, '2026-03-10 08:45:00' AS checked_in_at
    UNION ALL SELECT 'Kemahiran Kepimpinan PRS UMT 2026', 'Day 2 Workshop', '2026-03-11 09:00:00'
    UNION ALL SELECT 'Kemahiran Kepimpinan PRS UMT 2026', 'Day 3 Closing', '2026-03-12 08:50:00'
    UNION ALL SELECT 'Simposium Inovasi Pelajar FSKM 2026', 'Day 1 Symposium', '2026-04-14 09:10:00'
    UNION ALL SELECT 'Simposium Inovasi Pelajar FSKM 2026', 'Day 2 Pitching', '2026-04-15 09:00:00'
    UNION ALL SELECT 'ASEAN Youth Leadership Summit UMT 2026', 'Day 1 Summit Opening', '2026-02-24 08:30:00'
    UNION ALL SELECT 'ASEAN Youth Leadership Summit UMT 2026', 'Day 2 Workshop', '2026-02-25 09:00:00'
    UNION ALL SELECT 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan', 'Preliminary Round', '2026-06-08 09:00:00'
    UNION ALL SELECT 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan', 'Final Round', '2026-06-09 14:00:00'
    UNION ALL SELECT 'Pengenalan Arduino & Sensor Robotik 2026', 'Day 1 — Arduino Basics', '2026-05-10 08:55:00'
    UNION ALL SELECT 'Pengenalan Arduino & Sensor Robotik 2026', 'Day 2 — Sensor Integration', '2026-05-11 09:05:00'
    UNION ALL SELECT 'Bengkel Robot Line Follower FSKM 2026', 'Day 1 — Build & Calibrate', '2026-05-15 08:50:00'
    UNION ALL SELECT 'Bengkel Robot Line Follower FSKM 2026', 'Day 2 — Mini Competition', '2026-05-16 09:10:00'
) s ON s.title = p.title
WHERE p.status = 'COMPLETED'
  AND (r.user_id % 17) <> 0
  AND NOT EXISTS (
    SELECT 1 FROM programme_attendance a
    WHERE a.programme_id = p.id AND a.user_id = r.user_id AND a.session_label = s.session_label
  );

-- ========== 6. Merit records (participants with attendance) ==========
INSERT INTO student_merit_record (
    user_id, programme_id, programme_title, programme_level,
    merit_role_type, role_label, merit_points,
    academic_year, semester, status, awarded_at
)
SELECT
    r.user_id,
    p.id,
    p.title,
    p.programme_level,
    'PARTICIPANT',
    'Participant',
    p.merit_points,
    '2026',
    'Semester 1',
    'COMPLETED',
    DATE_ADD(p.end_date, INTERVAL 14 DAY)
FROM programme p
INNER JOIN programme_registration r ON r.programme_id = p.id AND r.status = 'ACTIVE'
WHERE p.status = 'COMPLETED'
  AND p.title IN (
    'Kemahiran Kepimpinan PRS UMT 2026',
    'Simposium Inovasi Pelajar FSKM 2026',
    'ASEAN Youth Leadership Summit UMT 2026',
    'Kejohanan Debat Antara Universiti Peringkat Kebangsaan',
    'Pengenalan Arduino & Sensor Robotik 2026',
    'Bengkel Robot Line Follower FSKM 2026'
  )
  AND EXISTS (
    SELECT 1 FROM programme_attendance a
    WHERE a.programme_id = p.id
      AND a.user_id = r.user_id
      AND a.attendance_status = 'PRESENT'
  )
  AND NOT EXISTS (
    SELECT 1 FROM student_merit_record m
    WHERE m.user_id = r.user_id
      AND m.programme_id = p.id
      AND m.merit_role_type = 'PARTICIPANT'
  );

-- Committee merit for completed robotics workshops (directors / MT / AJK on record)
INSERT INTO student_merit_record (
    user_id, programme_id, programme_title, programme_level,
    merit_role_type, role_label, merit_points,
    academic_year, semester, status, awarded_at
)
SELECT
    u.id,
    p.id,
    p.title,
    p.programme_level,
    pc.merit_role_type,
    COALESCE(pc.position_label, pc.committee_role),
    pc.merit_points,
    '2026',
    'Semester 1',
    'COMPLETED',
    DATE_ADD(p.end_date, INTERVAL 14 DAY)
FROM programme p
INNER JOIN programme_committee pc ON pc.programme_id = p.id
INNER JOIN user u ON UPPER(u.matric_number) = UPPER(pc.matric_number)
WHERE p.status = 'COMPLETED'
  AND p.sponsorship_info IN ('CAMPUSLINK_DEMO_V46', 'CAMPUSLINK_DEMO_V52')
  AND pc.merit_points > 0
  AND NOT EXISTS (
    SELECT 1 FROM student_merit_record m
    WHERE m.user_id = u.id
      AND m.programme_id = p.id
      AND m.merit_role_type = pc.merit_role_type
  );

-- ========== 7. Participation certificates (completed programmes) ==========
INSERT INTO student_certificate (
    user_id, programme_id, programme_title, organizer_club, certificate_type, issued_at, status
)
SELECT
    r.user_id,
    p.id,
    p.title,
    p.organizer_club,
    'PARTICIPATION',
    DATE_ADD(p.end_date, INTERVAL 3 DAY),
    'READY'
FROM programme p
INNER JOIN programme_registration r ON r.programme_id = p.id AND r.status = 'ACTIVE'
WHERE p.status = 'COMPLETED'
  AND EXISTS (
    SELECT 1 FROM programme_attendance a
    WHERE a.programme_id = p.id
      AND a.user_id = r.user_id
      AND a.attendance_status = 'PRESENT'
  )
  AND NOT EXISTS (
    SELECT 1 FROM student_certificate c
    WHERE c.user_id = r.user_id AND c.programme_id = p.id
  );

-- ========== 8. Ensure key demo students have rich merit profiles ==========
INSERT INTO student_merit_record (
    user_id, programme_id, programme_title, programme_level,
    merit_role_type, role_label, merit_points,
    academic_year, semester, status, awarded_at
)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points,
       '2026', 'Semester 1', 'COMPLETED', DATE_ADD(p.end_date, INTERVAL 14 DAY)
FROM programme p
CROSS JOIN user u
WHERE u.email IN ('sarahdemo335@gmail.com', 'syed.demo@gmail.com', 'ahmad.demo@gmail.com', 'abu.demo@gmail.com', 'safwan.demo@gmail.com')
  AND UPPER(u.role) = 'STUDENT'
  AND p.status = 'COMPLETED'
  AND p.title IN ('Kemahiran Kepimpinan PRS UMT 2026', 'Simposium Inovasi Pelajar FSKM 2026', 'Bengkel Robot Line Follower FSKM 2026')
  AND EXISTS (
    SELECT 1 FROM programme_registration r
    WHERE r.programme_id = p.id AND r.user_id = u.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM student_merit_record m
    WHERE m.user_id = u.id AND m.programme_id = p.id AND m.merit_role_type = 'PARTICIPANT'
  );
