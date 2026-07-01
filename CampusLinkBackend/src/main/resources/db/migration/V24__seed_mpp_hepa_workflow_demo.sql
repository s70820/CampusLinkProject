-- Realistic pending workflow items for MPP and HEPA demo portals

DELETE FROM role_request WHERE id > 0;

DELETE ps FROM programme_sdg ps
INNER JOIN programme p ON p.id = ps.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

DELETE FROM programme WHERE sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

-- Programmes awaiting MPP review
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'UMT Valorant Invitational 2026',
    'Kejohanan Valorant 5v5 terbuka kepada pelajar UMT. Format Swiss bracket dengan final di Dewan Kuliah Pusat.',
    'Sports', 'University', 'Physical', u.club_name,
    'Mempromosikan e-sports kompetitif di kampus.', 'Pasukan UMT bersaing dalam format kejohanan profesional.',
    'Makmal Komputer FSKM', '2026-08-05', '2026-08-06', '09:00:00', '20:00:00', 80,
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    10, 'PENDING_MPP_REVIEW', 'PENDING', 'PENDING', '2026-07-01', '2026-08-01', u.id, 'CAMPUSLINK_WORKFLOW_V24'
FROM user u WHERE u.email = 'organizer7.demo@gmail.com';

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'Hackathon Mini Inovasi FSKM 2026',
    'Hackathon 24 jam untuk pelajar FSKM membina prototip penyelesaian masalah kampus menggunakan teknologi web dan AI.',
    'Entrepreneurship', 'Faculty/Club', 'Hybrid', u.club_name,
    'Memupuk inovasi dan kerjasama pasukan teknikal.', 'Sekurang-kurangnya 10 prototip berfungsi dihasilkan.',
    'Makmal Komputer FSKM', '2026-08-20', '2026-08-21', '08:00:00', '20:00:00', 100,
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
    12, 'PENDING_MPP_REVIEW', 'PENDING', 'PENDING', '2026-07-15', '2026-08-15', u.id, 'CAMPUSLINK_WORKFLOW_V24'
FROM user u WHERE u.email = 'organizer1.demo@gmail.com';

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'Latihan Sukarelawan Kesiapsiagaan Banjir 2026',
    'Program latihan sukarelawan bersama agensi tempatan untuk persediaan bencana banjir di kawasan Kuala Terengganu.',
    'Volunteerism', 'University', 'Physical', u.club_name,
    'Meningkatkan kesiapsiagaan pelajar dalam bencana.', 'Sukarelawan terlatih untuk operasi bantuan banjir.',
    'Dewan Kuliah Pusat', '2026-09-10', '2026-09-11', '08:00:00', '17:00:00', 60,
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    10, 'PENDING_MPP_REVIEW', 'PENDING', 'PENDING', '2026-08-01', '2026-09-05', u.id, 'CAMPUSLINK_WORKFLOW_V24'
FROM user u WHERE u.email = 'organizer4.demo@gmail.com';

-- Programmes forwarded to HEPA (MPP already approved)
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    mpp_remarks, registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'MLBB Campus League Qualifier UMT',
    'Kelayakan Liga Kampus Mobile Legends: Bang Bang untuk mewakili UMT ke peringkat negeri.',
    'Sports', 'University', 'Physical', u.club_name,
    'Mencari pasukan MLBB terbaik UMT.', 'Pasukan juara mewakili UMT ke Liga Kampus Terengganu.',
    'Dewan Kuliah Pusat', '2026-07-25', '2026-07-26', '10:00:00', '22:00:00', 120,
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    10, 'PENDING_HEPA', 'APPROVED', 'PENDING',
    'Programme documentation complete. Recommended for HEPA final approval.',
    '2026-06-20', '2026-07-20', u.id, 'CAMPUSLINK_WORKFLOW_V24'
FROM user u WHERE u.email = 'organizer7.demo@gmail.com';

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    mpp_remarks, registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'Bengkel Fotografi Komuniti UMT',
    'Bengkel fotografi dokumentasi untuk pelajar yang terlibat dalam aktiviti komuniti dan sukarelawan.',
    'Culture', 'Faculty/Club', 'Physical', u.club_name,
    'Membina kemahiran dokumentasi visual aktiviti komuniti.', 'Pelajar menghasilkan portfolio dokumentasi komuniti.',
    'Galeri Seni UMT', '2026-08-12', '2026-08-13', '09:00:00', '16:00:00', 40,
    'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=900&q=80',
    8, 'PENDING_HEPA', 'APPROVED', 'PENDING',
    'Advisor form verified. Suitable for publication after HEPA review.',
    '2026-07-10', '2026-08-08', u.id, 'CAMPUSLINK_WORKFLOW_V24'
FROM user u WHERE u.email = 'organizer3.demo@gmail.com';

-- MPP rejected programme (for realistic stats)
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    mpp_remarks, registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'Karnival Permainan Tradisional UMT',
    'Karnival permainan tradisional Malaysia — cadangan awal tanpa borang penasihat yang lengkap.',
    'Culture', 'University', 'Physical', u.club_name,
    'Memelihara permainan tradisional.', 'Pelajar mengenali permainan tradisional Nusantara.',
    'Dataran Canselori', '2026-10-01', '2026-10-02', '09:00:00', '17:00:00', 150,
    'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=900&q=80',
    8, 'REJECTED', 'REJECTED', 'PENDING',
    'Advisor signed form incomplete. Please resubmit with full committee list and advisor endorsement.',
    '2026-09-01', '2026-09-25', u.id, 'CAMPUSLINK_WORKFLOW_V24'
FROM user u WHERE u.email = 'organizer5.demo@gmail.com';

-- Role upgrade requests for HEPA review
INSERT INTO role_request (user_id, requested_role, reason, document_name, status, created_at)
SELECT u.id, 'ORGANIZER',
    'Saya telah menjadi ahli jawatankuasa Kelab Robotik UMT selama 2 tahun dan ingin menganjurkan program STEM untuk pelajar FSKM.',
    'club-organizer-approval-form.pdf', 'PENDING_HEPA_APPROVAL', NOW() - INTERVAL 3 DAY
FROM user u WHERE u.email = 'sarah.demo@gmail.com';

INSERT INTO role_request (user_id, requested_role, reason, document_name, status, created_at)
SELECT u.id, 'MPP',
    'Saya pernah menjadi Exco Akademik FSKM dan ingin menyumbang dalam semakan program kampus sebagai wakil pelajar MPP.',
    'mpp-supporting-letter.pdf', 'PENDING_HEPA_APPROVAL', NOW() - INTERVAL 1 DAY
FROM user u WHERE u.email = 'amirul.demo@gmail.com';

INSERT INTO role_request (user_id, requested_role, reason, document_name, status, review_notes, reviewed_at, created_at)
SELECT u.id, 'ORGANIZER',
    'Permohonan untuk menganjurkan program keusahawanan berasaskan FTKK.',
    'organizer-form-ftkk.pdf', 'APPROVED', 'Dokumen lengkap. Diluluskan sebagai penganjur.',
    NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 14 DAY
FROM user u WHERE u.email = 'syed.demo@gmail.com';

INSERT INTO role_request (user_id, requested_role, reason, document_name, status, review_notes, reviewed_at, created_at)
SELECT u.id, 'MPP',
    'Permohonan untuk menyertai panel semakan MPP.',
    'mpp-application.pdf', 'REJECTED', 'Dokumen sokongan tidak mencukupi. Sila hantar semula dengan surat sokongan fakulti.',
    NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 8 DAY
FROM user u WHERE u.email = 'ahmad.demo@gmail.com';
