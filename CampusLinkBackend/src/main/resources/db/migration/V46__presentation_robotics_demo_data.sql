-- Presentation demo data (Jun 2026): Sarah (student), organizer8 (Robotics & AI Club),
-- amirul.demo (MPP), hepa.demo (HEPA). Robotics-themed programmes only for organizer8.

-- ========== 1. Demo account roles ==========
UPDATE user
SET role = 'MPP',
    approval_status = 'APPROVED',
    faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    club_name = NULL,
    club_id = NULL
WHERE email = 'amirul.demo@gmail.com';

UPDATE user
SET faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    club_name = 'Robotics & AI Club'
WHERE email = 'organizer8.demo@gmail.com';

UPDATE user u
INNER JOIN club c ON c.name = 'Robotics & AI Club'
SET u.club_id = c.id
WHERE u.email = 'organizer8.demo@gmail.com';

UPDATE club c
INNER JOIN user u ON u.email = 'organizer8.demo@gmail.com'
SET c.secretary_user_id = u.id
WHERE c.name = 'Robotics & AI Club';

-- ========== 2. Remove stale role requests (Amirul is MPP; Sarah stays student) ==========
DELETE rrh FROM role_request_history rrh
INNER JOIN role_request rr ON rr.id = rrh.role_request_id
INNER JOIN user u ON u.id = rr.user_id
WHERE u.email IN ('amirul.demo@gmail.com', 'sarahdemo335@gmail.com', 'sarah.demo@gmail.com');

DELETE rr FROM role_request rr
INNER JOIN user u ON u.id = rr.user_id
WHERE u.email IN ('amirul.demo@gmail.com', 'sarahdemo335@gmail.com', 'sarah.demo@gmail.com');

-- ========== 3. Replace old workflow demo (e-sports / unrelated) with Robotics & AI Club ==========
DELETE att FROM programme_attendance att
INNER JOIN programme p ON p.id = att.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE reg FROM programme_registration reg
INNER JOIN programme p ON p.id = reg.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE sm FROM student_merit_record sm
INNER JOIN programme p ON p.id = sm.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE sc FROM student_certificate sc
INNER JOIN programme p ON p.id = sc.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE wh FROM workflow_history wh
INNER JOIN programme p ON p.id = wh.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE pd FROM programme_document pd
INNER JOIN programme p ON p.id = pd.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE aa FROM advisor_approval aa
INNER JOIN programme p ON p.id = aa.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE pc FROM programme_committee pc
INNER JOIN programme p ON p.id = pc.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE ps FROM programme_sdg ps
INNER JOIN programme p ON p.id = ps.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE FROM programme WHERE sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

-- Pending MPP review (Robotics & AI Club)
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info,
    communication_link
)
SELECT
    'Kejohanan RoboRace Inter-Fakulti UMT 2026',
    'Pertandingan robot beroda terbuka kepada pelajar UMT. Pasukan membina robot autonomi mengikut trek yang ditetapkan di Makmal Robotik FSKM.',
    'Career', 'University', 'Physical', u.club_name,
    'Mempromosikan inovasi robotik dan kerjasama pasukan merentas fakulti.',
    'Sekurang-kurangnya 12 pasukan menyertai pusingan akhir.',
    'Makmal Robotik FSKM', '2026-08-22', '2026-08-23', '08:30:00', '18:00:00', 96,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    12, 'PENDING_MPP_REVIEW', 'PENDING', 'PENDING', '2026-07-15', '2026-08-18', u.id,
    'CAMPUSLINK_DEMO_V46', 'https://chat.whatsapp.com/demo-robotics-roborace'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Kejohanan RoboRace Inter-Fakulti UMT 2026');

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info,
    is_team_programme, team_name_required, min_team_size, max_team_size
)
SELECT
    'Hackathon Mini Robotik & AI FSKM 2026',
    'Hackathon 24 jam anjuran Robotics & AI Club: pasukan membina prototip robot/AI untuk masalah kampus (navigasi, pengutipan sisa, atau automasi makmal).',
    'Entrepreneurship', 'Faculty/Club', 'Hybrid', u.club_name,
    'Memupuk inovasi robotik dan literasi AI dalam kalangan pelajar FSKM.',
    'Minimum 8 prototip berfungsi dibentangkan pada hari akhir.',
    'Makmal Komputer FSKM', '2026-09-05', '2026-09-06', '08:00:00', '20:00:00', 80,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    10, 'PENDING_MPP_REVIEW', 'PENDING', 'PENDING', '2026-07-20', '2026-08-30', u.id,
    'CAMPUSLINK_DEMO_V46', TRUE, TRUE, 3, 5
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Hackathon Mini Robotik & AI FSKM 2026');

-- Forwarded to HEPA (MPP approved by Amirul)
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    mpp_remarks, registration_open_date, registration_close_date, organizer_id, sponsorship_info,
    communication_link
)
SELECT
    'Hari Pameran Dron Autonomi UMT 2026',
    'Pameran dan demonstrasi dron autonomi oleh Robotics & AI Club termasuk sesi hands-on pengaturcaraan laluan penerbangan.',
    'Career', 'University', 'Physical', u.club_name,
    'Mendedahkan teknologi dron autonomi kepada pelajar UMT.',
    'Pelajar memahami asas kawalan dron dan aplikasi kampus.',
    'Padang Terbuka FSKM', '2026-08-08', '2026-08-08', '09:00:00', '16:00:00', 120,
    'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=900&q=80',
    8, 'PENDING_HEPA', 'APPROVED', 'PENDING',
    'Dokumentasi lengkap. Program STEM sesuai untuk publikasi kampus.',
    '2026-06-25', '2026-08-01', u.id, 'CAMPUSLINK_DEMO_V46',
    'https://chat.whatsapp.com/demo-robotics-drone'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Hari Pameran Dron Autonomi UMT 2026');

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    mpp_remarks, registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'STEM Outreach: Robotik untuk Pelajar Sekolah Menengah',
    'Program outreach Robotics & AI Club ke sekolah menengah sekitar Kuala Terengganu — bengkel robotik asas dan demonstrasi AI.',
    'Volunteerism', 'National', 'Physical', u.club_name,
    'Menginspirasi pelajar sekolah menengah dalam bidang STEM dan robotik.',
    'Sekurang-kurangnya 60 pelajar sekolah menengah terlibat.',
    'SMK Sultan Sulaiman, Kuala Terengganu', '2026-09-14', '2026-09-14', '08:00:00', '14:00:00', 40,
    'https://images.unsplash.com/photo-1532094344004-09fa9d4dc63d?auto=format&fit=crop&w=900&q=80',
    10, 'PENDING_HEPA', 'APPROVED', 'PENDING',
    'Borang penasihat disahkan. Outreach STEM disyorkan untuk kelulusan HEPA.',
    '2026-08-01', '2026-09-08', u.id, 'CAMPUSLINK_DEMO_V46'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'STEM Outreach: Robotik untuk Pelajar Sekolah Menengah');

-- MPP rejected (organizer can resubmit)
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    mpp_remarks, registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'Karnival Robot Gergasi UMT',
    'Cadangan karnival robot gergasi tanpa senarai jawatankuasa lengkap dan borang penasihat yang ditandatangani.',
    'Career', 'University', 'Physical', u.club_name,
    'Memperkenalkan robot gergasi kepada pelajar.', 'Pelajar melihat demonstrasi robot gergasi.',
    'Dataran Canselori', '2026-10-10', '2026-10-11', '09:00:00', '17:00:00', 200,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    8, 'REJECTED', 'REJECTED', 'PENDING',
    'Senarai jawatankuasa tidak lengkap. Muat naik borang penasihat yang ditandatangani dan hantar semula.',
    '2026-09-01', '2026-10-05', u.id, 'CAMPUSLINK_DEMO_V46'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Karnival Robot Gergasi UMT');

-- ========== 4. More Robotics & AI Club programmes (organizer dashboard + student browse) ==========
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info,
    communication_link, completed_at
)
SELECT
    'Pengenalan Arduino & Sensor Robotik 2026',
    'Bengkel asas Arduino, sensor ultrasonik, dan motor servo untuk ahli baru Robotics & AI Club.',
    'Career', 'Faculty/Club', 'Physical', u.club_name,
    'Memperkenalkan asas elektronik dan pengaturcaraan mikro pengawal.',
    'Peserta dapat membina robot mengelak halangan ringkas.',
    'Makmal Robotik FSKM', '2026-05-10', '2026-05-11', '09:00:00', '16:30:00', 35,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    5, 'COMPLETED', 'APPROVED', 'APPROVED', '2026-04-01', '2026-05-05', u.id,
    'CAMPUSLINK_DEMO_V46', NULL, '2026-05-12 17:00:00'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Pengenalan Arduino & Sensor Robotik 2026');

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info,
    communication_link
)
SELECT
    'Bootcamp Visi Komputer untuk Robotik',
    'Bengkel OpenCV dan Python untuk pengesanan objek pada robot mudah alih. Terbuka kepada pelajar FSKM.',
    'Career', 'Faculty/Club', 'Hybrid', u.club_name,
    'Meningkatkan kemahiran AI penglihatan komputer untuk aplikasi robotik.',
    'Peserta melaksanakan modul pengesanan warna pada robot rover.',
    'Makmal Komputer FSKM', '2026-07-18', '2026-07-19', '09:00:00', '17:00:00', 45,
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=900&q=80',
    8, 'APPROVED', 'APPROVED', 'APPROVED', '2026-06-10', '2026-07-12', u.id,
    'CAMPUSLINK_DEMO_V46', 'https://chat.whatsapp.com/demo-robotics-cv-bootcamp'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Bootcamp Visi Komputer untuk Robotik');

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    organizer_id, sponsorship_info
)
SELECT
    'Bengkel Percetakan 3D untuk Komponen Robot',
    'Draf program — belum dihantar ke MPP. Fokus reka bentuk bracket dan gear custom menggunakan pencetak 3D makmal.',
    'Career', 'Faculty/Club', 'Physical', u.club_name,
    'Membina kemahiran CAD dan percetakan 3D untuk robotik.', 'Peserta menghasilkan komponen 3D untuk robot.',
    'Makmal Robotik FSKM', '2026-11-08', '2026-11-09', '09:00:00', '16:00:00', 30,
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80',
    5, 'DRAFT', 'PENDING', 'PENDING', u.id, 'CAMPUSLINK_DEMO_V46'
FROM user u WHERE u.email = 'organizer8.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Bengkel Percetakan 3D untuk Komponen Robot');

-- Align existing paid workshop dates & club ownership
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer8.demo@gmail.com'
SET p.organizer_id = u.id,
    p.organizer_club = u.club_name,
    p.registration_open_date = '2026-06-01',
    p.registration_close_date = '2026-09-08',
    p.start_date = '2026-09-12',
    p.end_date = '2026-09-12',
    p.status = 'APPROVED',
    p.completed_at = NULL,
    p.communication_link = 'https://chat.whatsapp.com/demo-robotics-lanjutan'
WHERE p.title = 'Bengkel Robotik Lanjutan';

-- ========== 5. Committee, SDG, advisor, documents for workflow programmes ==========
INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70002', 'Muhammad Hafiz bin Razak', 'Faculty of Computer Science and Mathematics (FSKM)', 'PENGARAH_PROGRAM', 'DIRECTOR', 15, TRUE, NULL
FROM programme p WHERE p.title = 'Kejohanan RoboRace Inter-Fakulti UMT 2026' AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
AND NOT EXISTS (SELECT 1 FROM programme_committee pc WHERE pc.programme_id = p.id);

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70003', 'Tan Wei Lin', 'Faculty of Computer Science and Mathematics (FSKM)', 'MT_PROGRAM', 'MT', 12, TRUE, 'Track & Logistics'
FROM programme p WHERE p.title = 'Kejohanan RoboRace Inter-Fakulti UMT 2026' AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46';

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account)
SELECT p.id, 'S70462', 'Sarah Amara', 'Faculty of Computer Science and Mathematics (FSKM)', 'AJK_PROGRAM', 'AJK', 10, TRUE
FROM programme p WHERE p.title = 'Hackathon Mini Robotik & AI FSKM 2026' AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
AND NOT EXISTS (SELECT 1 FROM programme_committee pc WHERE pc.programme_id = p.id AND pc.matric_number = 'S70462');

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70001', 'Nur Aisyah binti Abdullah', 'Faculty of Computer Science and Mathematics (FSKM)', 'PENGARAH_PROGRAM', 'DIRECTOR', 15, TRUE, NULL
FROM programme p WHERE p.title = 'Hackathon Mini Robotik & AI FSKM 2026' AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
AND NOT EXISTS (SELECT 1 FROM programme_committee pc WHERE pc.programme_id = p.id AND pc.committee_role = 'PENGARAH_PROGRAM');

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70008', 'Rajkumar a/l Muthusamy', 'Faculty of Ocean Engineering Technology (FTKK)', 'PENGARAH_PROGRAM', 'DIRECTOR', 12, TRUE, NULL
FROM programme p WHERE p.title = 'Hari Pameran Dron Autonomi UMT 2026' AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
AND NOT EXISTS (SELECT 1 FROM programme_committee pc WHERE pc.programme_id = p.id);

INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT p.id, n.sdg
FROM programme p
CROSS JOIN (SELECT 4 AS sdg UNION ALL SELECT 9 UNION ALL SELECT 17) n
WHERE p.title IN (
    'Kejohanan RoboRace Inter-Fakulti UMT 2026',
    'Hackathon Mini Robotik & AI FSKM 2026',
    'Hari Pameran Dron Autonomi UMT 2026',
    'STEM Outreach: Robotik untuk Pelajar Sekolah Menengah'
) AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
AND NOT EXISTS (SELECT 1 FROM programme_sdg ps WHERE ps.programme_id = p.id AND ps.sdg_number = n.sdg);

INSERT INTO advisor_approval (programme_id, advisor_name, advisor_email, approval_method, status, remarks, approved_at)
SELECT p.id, 'Dr. Siti Aminah binti Yusof', 'siti.aminah@umt.edu.my', 'SIGNED_PDF', 'APPROVED',
    'Programme documentation complete. Recommended for HEPA final approval.', NOW() - INTERVAL 2 DAY
FROM programme p
WHERE p.title IN ('Hari Pameran Dron Autonomi UMT 2026', 'STEM Outreach: Robotik untuk Pelajar Sekolah Menengah')
  AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
AND NOT EXISTS (SELECT 1 FROM advisor_approval aa WHERE aa.programme_id = p.id);

INSERT INTO advisor_approval (programme_id, advisor_name, advisor_email, approval_method, status, remarks, approved_at)
SELECT p.id, 'Dr. Siti Aminah binti Yusof', 'siti.aminah@umt.edu.my', 'ONLINE', 'APPROVED',
    'Robotics competition proposal verified by club advisor.', NOW() - INTERVAL 1 DAY
FROM programme p
WHERE p.title IN ('Kejohanan RoboRace Inter-Fakulti UMT 2026', 'Hackathon Mini Robotik & AI FSKM 2026')
  AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
AND NOT EXISTS (SELECT 1 FROM advisor_approval aa WHERE aa.programme_id = p.id);

INSERT INTO programme_document (programme_id, document_type, file_path, file_name)
SELECT p.id, 'APPLICATION_PDF', 'uploads/demo-docs/mystar-application-form.pdf', CONCAT('MyStar Application - ', p.title, '.pdf')
FROM programme p
WHERE p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
  AND p.status IN ('PENDING_MPP_REVIEW', 'PENDING_HEPA')
AND NOT EXISTS (SELECT 1 FROM programme_document pd WHERE pd.programme_id = p.id AND pd.document_type = 'APPLICATION_PDF');

INSERT INTO programme_document (programme_id, document_type, file_path, file_name)
SELECT p.id, 'ADVISOR_SIGNED', 'uploads/demo-docs/advisor-signed-form.pdf', CONCAT('Advisor Signed Form - ', p.title, '.pdf')
FROM programme p
WHERE p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
  AND p.status IN ('PENDING_MPP_REVIEW', 'PENDING_HEPA')
AND NOT EXISTS (SELECT 1 FROM programme_document pd WHERE pd.programme_id = p.id AND pd.document_type = 'ADVISOR_SIGNED');

INSERT INTO workflow_history (programme_id, from_status, to_status, action, performed_by, remarks, created_at)
SELECT p.id, 'PENDING_MPP_REVIEW', 'PENDING_HEPA', 'MPP_APPROVE', u.id,
    p.mpp_remarks, NOW() - INTERVAL 1 DAY
FROM programme p
CROSS JOIN user u
WHERE u.email = 'amirul.demo@gmail.com'
  AND p.title IN ('Hari Pameran Dron Autonomi UMT 2026', 'STEM Outreach: Robotik untuk Pelajar Sekolah Menengah')
  AND p.sponsorship_info = 'CAMPUSLINK_DEMO_V46'
AND NOT EXISTS (
    SELECT 1 FROM workflow_history wh
    WHERE wh.programme_id = p.id AND wh.action = 'MPP_APPROVE'
);

-- ========== 6. HEPA role requests (keep variety; no Sarah / Amirul) ==========
INSERT INTO role_request (user_id, requested_role, reason, document_name, documents_json, club_name, status, created_at)
SELECT u.id, 'ORGANIZER',
    'Saya telah menjadi AJK Kelab Keusahawanan UMT selama 1 sesi dan ingin menganjurkan program keusahawanan digital.',
    'club-organizer-approval-form.pdf',
    '[{"path":"uploads/demo-docs/umt-club-organizer-approval-form.pdf","name":"UMT Club Organizer Approval Form.pdf"}]',
    'Kelab Keusahawanan UMT', 'PENDING_HEPA_APPROVAL', NOW() - INTERVAL 4 DAY
FROM user u WHERE u.email = 'abu.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM role_request rr WHERE rr.user_id = u.id AND rr.status = 'PENDING_HEPA_APPROVAL');

INSERT INTO role_request (user_id, requested_role, reason, document_name, documents_json, club_name, status, review_notes, reviewed_at, created_at)
SELECT u.id, 'ORGANIZER',
    'Permohonan untuk menganjurkan program keusahawanan berasaskan FTKK.',
    'organizer-form-ftkk.pdf',
    '[{"path":"uploads/demo-docs/umt-club-organizer-approval-form.pdf","name":"organizer-form-ftkk.pdf"}]',
    'Persatuan Mahasiswa FTKK', 'APPROVED', 'Dokumen lengkap. Diluluskan sebagai penganjur.',
    NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 14 DAY
FROM user u WHERE u.email = 'syed.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM role_request rr WHERE rr.user_id = u.id AND rr.status = 'APPROVED');

INSERT INTO role_request (user_id, requested_role, reason, document_name, documents_json, status, review_notes, reviewed_at, created_at)
SELECT u.id, 'MPP',
    'Permohonan untuk menyertai panel semakan MPP.',
    'mpp-application.pdf',
    '[{"path":"uploads/demo-docs/faculty-endorsement-letter.pdf","name":"mpp-application.pdf"}]',
    'REJECTED', 'Dokumen sokongan tidak mencukupi. Sila hantar semula dengan surat sokongan fakulti.',
    NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 8 DAY
FROM user u WHERE u.email = 'ahmad.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM role_request rr WHERE rr.user_id = u.id AND rr.status = 'REJECTED');

-- ========== 7. Sarah (sarahdemo335) — robotics-focused student portal data ==========
DELETE sm FROM student_merit_record sm
INNER JOIN user u ON u.id = sm.user_id
INNER JOIN programme p ON p.id = sm.programme_id
WHERE u.email = 'sarahdemo335@gmail.com'
  AND p.title IN ('Kejohanan Debat Antara Universiti Peringkat Kebangsaan');

DELETE sc FROM student_certificate sc
INNER JOIN user u ON u.id = sc.user_id
INNER JOIN programme p ON p.id = sc.programme_id
WHERE u.email = 'sarahdemo335@gmail.com'
  AND p.title IN ('Kejohanan Debat Antara Universiti Peringkat Kebangsaan');

DELETE att FROM programme_attendance att
INNER JOIN user u ON u.id = att.user_id
INNER JOIN programme p ON p.id = att.programme_id
WHERE u.email = 'sarahdemo335@gmail.com'
  AND p.title IN (
    'Kejohanan Debat Antara Universiti Peringkat Kebangsaan',
    'Kejohanan E-Sports Inter-Fakulti UMT 2026'
);

DELETE pr FROM programme_registration pr
INNER JOIN user u ON u.id = pr.user_id
INNER JOIN programme p ON p.id = pr.programme_id
WHERE u.email = 'sarahdemo335@gmail.com'
  AND p.title IN (
    'Kejohanan Debat Antara Universiti Peringkat Kebangsaan',
    'Kejohanan E-Sports Inter-Fakulti UMT 2026',
    'Bengkel Streaming & Pengurusan Komuniti E-Sports'
);

-- Completed robotics workshop
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-04-28 10:00:00'
FROM programme p, user u
WHERE u.email = 'sarahdemo335@gmail.com' AND p.title = 'Pengenalan Arduino & Sensor Robotik 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 1 — Arduino Basics', 'PRESENT', '2026-05-10 08:55:00'
FROM programme p, user u
WHERE u.email = 'sarahdemo335@gmail.com' AND p.title = 'Pengenalan Arduino & Sensor Robotik 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 1 — Arduino Basics');

INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 2 — Sensor Integration', 'PRESENT', '2026-05-11 09:05:00'
FROM programme p, user u
WHERE u.email = 'sarahdemo335@gmail.com' AND p.title = 'Pengenalan Arduino & Sensor Robotik 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 2 — Sensor Integration');

INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-05-12'
FROM programme p, user u
WHERE u.email = 'sarahdemo335@gmail.com' AND p.title = 'Pengenalan Arduino & Sensor Robotik 2026'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

INSERT INTO student_certificate (user_id, programme_id, programme_title, organizer_club, certificate_type, issued_at, status)
SELECT u.id, p.id, p.title, p.organizer_club, 'PARTICIPATION', '2026-05-15', 'READY'
FROM programme p, user u
WHERE u.email = 'sarahdemo335@gmail.com' AND p.title = 'Pengenalan Arduino & Sensor Robotik 2026'
AND NOT EXISTS (SELECT 1 FROM student_certificate c WHERE c.user_id = u.id AND c.programme_id = p.id);

-- Active registrations (robotics + FSKM tech)
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, payment_reference, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', 'RobotikLanjutan_S70462', '2026-06-12 11:30:00'
FROM programme p, user u
WHERE u.email = 'sarahdemo335@gmail.com' AND p.title = 'Bengkel Robotik Lanjutan'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-06-18 14:00:00'
FROM programme p, user u
WHERE u.email = 'sarahdemo335@gmail.com' AND p.title = 'Bootcamp Visi Komputer untuk Robotik'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-05-20 09:00:00'
FROM programme p, user u
WHERE u.email = 'sarahdemo335@gmail.com' AND p.title = 'Bengkel Kemahiran Industri 4.0 FSKM'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

-- ========== 8. Registrations on organizer8 programmes (fuller participant lists) ==========
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-06-15 10:00:00'
FROM programme p
CROSS JOIN user u
WHERE p.title = 'Bootcamp Visi Komputer untuk Robotik'
  AND u.matric_number IN ('S70001', 'S70003', 'S70004', 'S70008', 'S70877')
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, payment_reference, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', CONCAT('RobotikLanjutan_', u.matric_number), '2026-06-10 09:00:00'
FROM programme p
CROSS JOIN user u
WHERE p.title = 'Bengkel Robotik Lanjutan'
  AND u.matric_number IN ('S70001', 'S70002', 'S70005', 'S70016', 'S70022')
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-05-08 08:30:00'
FROM programme p
CROSS JOIN user u
WHERE p.title = 'Pengenalan Arduino & Sensor Robotik 2026'
  AND u.matric_number IN ('S70001', 'S70003', 'S70006', 'S70011')
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);
