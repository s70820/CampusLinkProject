-- Club profiles for demo organizers and realistic programme ownership per club

ALTER TABLE user
    ADD COLUMN club_name VARCHAR(255) NULL;

UPDATE user SET club_name = 'Persatuan Mahasiswa FSKM' WHERE email = 'organizer1.demo@gmail.com';
UPDATE user SET club_name = 'Persatuan Mahasiswa FTKK' WHERE email = 'organizer2.demo@gmail.com';
UPDATE user SET club_name = 'Persatuan Mahasiswa FPSM' WHERE email = 'organizer3.demo@gmail.com';
UPDATE user SET club_name = 'Kelab Sukarelawan UMT' WHERE email = 'organizer4.demo@gmail.com';
UPDATE user SET club_name = 'Kelab Keusahawanan UMT' WHERE email = 'organizer5.demo@gmail.com';
UPDATE user SET club_name = 'Kelab Sukan dan Rekreasi' WHERE email = 'organizer6.demo@gmail.com';
UPDATE user SET club_name = 'Kelab E-Sports UMT' WHERE email = 'organizer7.demo@gmail.com';
UPDATE user SET club_name = 'Robotics & AI Club' WHERE email = 'organizer8.demo@gmail.com';

-- FSKM / leadership & innovation
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer1.demo@gmail.com'
SET p.organizer_id = u.id, p.organizer_club = u.club_name
WHERE p.title IN (
    'Kemahiran Kepimpinan PRS UMT 2026',
    'Simposium Inovasi Pelajar FSKM 2026',
    'Bengkel Kemahiran Industri 4.0 FSKM'
);

-- FTKK / engineering & research
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer2.demo@gmail.com'
SET p.organizer_id = u.id, p.organizer_club = u.club_name
WHERE p.title IN (
    'International Research and Innovation Expo UMT',
    'Bengkel Robotik dan Automasi FTKK'
);

-- FPSM / culture & community arts
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer3.demo@gmail.com'
SET p.organizer_id = u.id, p.organizer_club = u.club_name
WHERE p.title IN (
    'Festival Seni dan Budaya Malaysia UMT 2026',
    'Program Ibadah dan Kepimpinan Ramadan UMT'
);

-- Volunteer & sustainability programmes
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer4.demo@gmail.com'
SET p.organizer_id = u.id, p.organizer_club = u.club_name
WHERE p.title IN (
    'Program Khidmat Masyarakat Negeri Terengganu',
    'Global Volunteer Coastal Cleanup Programme',
    'Latihan Sukarelawan Kesiapsiagaan Bencana',
    'International Symposium on Sustainable Development Goals'
);

-- Entrepreneurship & debate
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer5.demo@gmail.com'
SET p.organizer_id = u.id, p.organizer_club = u.club_name
WHERE p.title IN (
    'Karnival Keusahawanan Siswazah Terengganu 2026',
    'Kejohanan Debat Antara Universiti Peringkat Kebangsaan'
);

-- Sports programmes
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer6.demo@gmail.com'
SET p.organizer_id = u.id, p.organizer_club = u.club_name
WHERE p.title IN (
    'Karnival Sukan Inter-Fakulti UMT 2026',
    'Football Tournament'
);

-- Robotics advanced workshop
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer8.demo@gmail.com'
SET p.organizer_id = u.id, p.organizer_club = u.club_name
WHERE p.title = 'Bengkel Robotik Lanjutan';

-- E-Sports club programmes
INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info
)
SELECT
    'Kejohanan E-Sports Inter-Fakulti UMT 2026',
    'Kejohanan e-sports tahunan anjuran Kelab E-Sports UMT melibatkan pertandingan Mobile Legends, Valorant, dan EA Sports FC. Terbuka kepada semua pelajar UMT.',
    'Sports', 'University', 'Physical', u.club_name,
    'Mempromosikan industri e-sports kampus dan kerjasama pasukan.', 'Pelajar bersaing secara sihat dalam arena e-sports.', 'Dewan Kuliah Pusat',
    '2026-06-15', '2026-06-17', '09:00:00', '22:00:00', 200,
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    10, 'APPROVED', 'APPROVED', 'APPROVED', '2026-05-01', '2026-06-10', u.id, 'CAMPUSLINK_ESPORTS_V22'
FROM user u
WHERE u.email = 'organizer7.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Kejohanan E-Sports Inter-Fakulti UMT 2026');

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info,
    is_paid, registration_fee, payment_instructions, payment_reference_format
)
SELECT
    'Bengkel Streaming & Pengurusan Komuniti E-Sports',
    'Bengkel hands-on penstriman Twitch/YouTube, pengurusan komuniti Discord, dan asas pengurusan kejohanan e-sports untuk ahli Kelab E-Sports UMT.',
    'Career', 'Faculty/Club', 'Hybrid', u.club_name,
    'Membina kemahiran kandungan dan komuniti e-sports.', 'Ahli kelab boleh menstrim dan mengurus acara mini.',
    'Makmal Komputer FSKM',
    '2026-07-20', '2026-07-21', '09:00:00', '17:00:00', 60,
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    8, 'APPROVED', 'APPROVED', 'APPROVED', '2026-06-15', '2026-07-15', u.id, 'CAMPUSLINK_ESPORTS_V22',
    TRUE, 20.00,
    'Bayar RM20 ke akaun Kelab E-Sports UMT dan muat naik resit.',
    'EsportsBengkel_MatricNumber'
FROM user u
WHERE u.email = 'organizer7.demo@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Bengkel Streaming & Pengurusan Komuniti E-Sports');

-- Remove unrelated legacy demo programmes that do not belong to any seeded club
DELETE ps FROM programme_sdg ps
INNER JOIN programme p ON p.id = ps.programme_id
WHERE p.title IN ('Leadership Bootcamp', 'Test Programme')
  AND (p.sponsorship_info IS NULL OR p.sponsorship_info NOT IN ('CAMPUSLINK_SEED_V9', 'CAMPUSLINK_ESPORTS_V22'));

DELETE FROM programme
WHERE title IN ('Leadership Bootcamp', 'Test Programme')
  AND (sponsorship_info IS NULL OR sponsorship_info NOT IN ('CAMPUSLINK_SEED_V9', 'CAMPUSLINK_ESPORTS_V22'));

-- Reassign any remaining seed programmes still tied to a non-demo organizer account
UPDATE programme p
INNER JOIN user u ON u.email = 'organizer1.demo@gmail.com'
SET p.organizer_id = u.id
WHERE p.sponsorship_info = 'CAMPUSLINK_SEED_V9'
  AND p.organizer_id NOT IN (SELECT id FROM user WHERE email LIKE 'organizer%.demo@gmail.com');
