-- Realistic UMT co-curricular programmes for FYP demonstration (CampusLink+ seed V9)

DELETE ps FROM programme_sdg ps
INNER JOIN programme p ON p.id = ps.programme_id
WHERE p.sponsorship_info = 'CAMPUSLINK_SEED_V9';

DELETE FROM programme WHERE sponsorship_info = 'CAMPUSLINK_SEED_V9';

SET @organizer_id = (SELECT id FROM user WHERE role = 'ORGANIZER' ORDER BY id LIMIT 1);

INSERT INTO programme (
    title, description, category, programme_level, programme_type, organizer_club,
    objectives, expected_outcomes, venue, start_date, end_date, start_time, end_time,
    expected_participants, poster_path, merit_points, status, mpp_status, hepa_status,
    registration_open_date, registration_close_date, organizer_id, sponsorship_info
) VALUES
(
    'Kemahiran Kepimpinan PRS UMT 2026',
    'Program pembangunan kepimpinan pelajar anjuran Kelab Pembimbing Rakan Siswa (PRS) UMT. Peserta akan melalui modul komunikasi berkesan, pengurusan konflik, dan kepimpinan beretika dalam konteks kampus.',
    'Leadership', 'University', 'Physical', 'Kelab Pembimbing Rakan Siswa (PRS)',
    'Membina kemahiran kepimpinan pelajar tahun satu dan dua.', 'Pelajar dapat memimpin aktiviti kumpulan dengan yakin.', 'Dewan Kuliah Pusat',
    '2026-03-10', '2026-03-12', '08:30:00', '17:00:00', 120,
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
    10, 'APPROVED', 'APPROVED', 'APPROVED', '2026-02-01', '2026-03-05', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Simposium Inovasi Pelajar FSKM 2026',
    'Simposium tahunan pelajar FSKM yang mempamerkan projek inovasi digital, analitik data, dan penyelesaian masalah komuniti kampus. Termasuk pembentangan poster dan sesi pitching ringkas.',
    'Entrepreneurship', 'University', 'Hybrid', 'Persatuan Mahasiswa FSKM',
    'Meningkatkan budaya inovasi dalam kalangan pelajar FSKM.', 'Sekurang-kurangnya 20 projek inovasi dipamerkan.', 'FSKM Seminar Room',
    '2026-04-14', '2026-04-15', '09:00:00', '16:30:00', 200,
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
    10, 'APPROVED', 'APPROVED', 'APPROVED', '2026-03-01', '2026-04-08', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Karnival Sukan Inter-Fakulti UMT 2026',
    'Karnival sukan tahunan UMT melibatkan pertandingan futsal, bola jaring, badminton, dan acara sukan konflik. Terbuka kepada semua pelajar UMT.',
    'Sports', 'University', 'Physical', 'Kelab Sukan dan Rekreasi',
    'Mempromosikan gaya hidup sihat dan perpaduan pelajar.', 'Peningkatan penyertaan sukan inter-fakulti.', 'Pusat Sukan UMT',
    '2026-05-20', '2026-05-22', '08:00:00', '18:00:00', 350,
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',
    10, 'APPROVED', 'APPROVED', 'APPROVED', '2026-04-01', '2026-05-15', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Kejohanan Debat Antara Universiti Peringkat Kebangsaan',
    'Pertandingan debat peringkat kebangsaan dianjurkan Kelab Debat UMT dengan tema isu semasa pendidikan, kelestarian, dan dasar belia Malaysia.',
    'Career', 'National', 'Physical', 'Kelab Debat UMT',
    'Memperkasa kemahiran debat dan analisis isu semasa.', 'Pasukan UMT bersaing di peringkat kebangsaan.', 'Auditorium Mahyuddin',
    '2026-06-08', '2026-06-10', '08:00:00', '22:00:00', 180,
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
    30, 'APPROVED', 'APPROVED', 'APPROVED', '2026-05-01', '2026-06-01', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Karnival Keusahawanan Siswazah Terengganu 2026',
    'Karnival keusahawanan menampilkan pameran produk pelajar, bengkel pemasaran digital, dan sesi mentor bersama usahawan tempatan.',
    'Entrepreneurship', 'National', 'Physical', 'Kelab Keusahawanan',
    'Memupuk semangat keusahawanan dalam kalangan pelajar.', 'Pelajar mempelajari asas perniagaan dan branding.', 'Dewan Sultan Mizan',
    '2026-07-06', '2026-07-08', '09:00:00', '17:00:00', 250,
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    30, 'APPROVED', 'APPROVED', 'APPROVED', '2026-06-01', '2026-06-28', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Program Khidmat Masyarakat Negeri Terengganu',
    'Program sukarelawan ke komuniti sekitar Kuala Terengganu termasuk gotong-royong, bengkel literasi digital, dan aktiviti kesihatan komuniti.',
    'Volunteerism', 'National', 'Physical', 'Kelab Sukarelawan UMT',
    'Meningkatkan kesedaran tanggungjawab sosial pelajar.', 'Komuniti mendapat manfaat langsung daripada aktiviti sukarelawan.', 'Community Centres around Terengganu',
    '2026-08-12', '2026-08-14', '07:30:00', '16:00:00', 100,
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    30, 'APPROVED', 'APPROVED', 'APPROVED', '2026-07-01', '2026-08-05', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Festival Seni dan Budaya Malaysia UMT 2026',
    'Festival budaya menampilkan persembahan tradisional, pameran kraftangan, dan bengkel warisan seni Nusantara.',
    'Culture', 'National', 'Physical', 'Kelab Kebudayaan',
    'Memelihara warisan budaya Malaysia dalam kalangan pelajar.', 'Pelajar menghargai kepelbagaian budaya negara.', 'Dataran Canselori',
    '2026-09-18', '2026-09-20', '10:00:00', '22:00:00', 300,
    'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=900&q=80',
    30, 'APPROVED', 'APPROVED', 'APPROVED', '2026-08-01', '2026-09-12', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'ASEAN Youth Leadership Summit UMT 2026',
    'Sidang kemuncak kepimpinan belia ASEAN dengan delegasi pelajar antarabangsa, bengkel diplomasi belia, dan projek kolaboratif merentas negara.',
    'Leadership', 'International', 'Hybrid', 'Majlis Perwakilan Pelajar (MPP)',
    'Membina jaringan kepimpinan belia ASEAN.', 'Delegasi membangunkan pelan tindakan kepimpinan komuniti.', 'Dewan Sultan Mizan',
    '2026-02-24', '2026-02-27', '08:00:00', '18:00:00', 150,
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    50, 'APPROVED', 'APPROVED', 'APPROVED', '2026-01-05', '2026-02-15', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'International Research and Innovation Expo UMT',
    'Pameran penyelidikan dan inovasi antarabangsa melibatkan kerjasama universiti luar negara, pembentangan kertas kerja, dan demonstrasi prototaip.',
    'Entrepreneurship', 'International', 'Physical', 'Persatuan Mahasiswa FTKK',
    'Mempromosikan penyelidikan bertaraf antarabangsa.', 'Pelajar terlibat dalam perbincangan penyelidikan global.', 'FTKK Seminar Room',
    '2026-10-07', '2026-10-09', '09:00:00', '17:30:00', 220,
    'https://images.unsplash.com/photo-1532094344004-09fa9d4dc63d?auto=format&fit=crop&w=900&q=80',
    50, 'APPROVED', 'APPROVED', 'APPROVED', '2026-09-01', '2026-09-30', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Global Volunteer Coastal Cleanup Programme',
    'Program sukarelawan antarabangsa pembersihan pantai di Pantai Tok Jembal dengan kerjasama NGO alam sekitar dan delegasi pelajar asing.',
    'Volunteerism', 'International', 'Physical', 'Kelab Sukarelawan UMT',
    'Meningkatkan kesedaran alam sekitar dan kerjasama global.', 'Kawasan pantai dibersihkan dan data sisa dikumpulkan.', 'Pantai Tok Jembal',
    '2026-11-14', '2026-11-15', '07:00:00', '13:00:00', 80,
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=900&q=80',
    50, 'APPROVED', 'APPROVED', 'APPROVED', '2026-10-01', '2026-11-08', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'International Symposium on Sustainable Development Goals',
    'Simposium antarabangsa SDG anjuran HEPA UMT dengan pembentangan panel pakar, bengkel pelaksanaan SDG di kampus, dan lawatan ke Taman Tamadun Islam.',
    'Volunteerism', 'International', 'Hybrid', 'HEPA UMT',
    'Memperkasa pemahaman SDG dalam kalangan pelajar UMT.', 'Pelajar merangka inisiatif SDG untuk kampus.', 'Perpustakaan Sultanah Nur Zahirah',
    '2026-12-02', '2026-12-04', '08:30:00', '17:00:00', 180,
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=900&q=80',
    50, 'APPROVED', 'APPROVED', 'APPROVED', '2026-11-01', '2026-11-25', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Bengkel Kemahiran Industri 4.0 FSKM',
    'Bengkel hands-on pengaturcaraan, IoT asas, dan analitik data untuk pelajar FSKM dengan fasilitator industri tempatan.',
    'Career', 'Faculty/Club', 'Physical', 'Persatuan Mahasiswa FSKM',
    'Meningkatkan kemahiran digital pelajar FSKM.', 'Pelajar dapat melaksanakan projek mini IoT.', 'FSKM Seminar Room',
    '2026-03-22', '2026-03-23', '09:00:00', '16:00:00', 60,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    5, 'APPROVED', 'APPROVED', 'APPROVED', '2026-02-15', '2026-03-18', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Bengkel Robotik dan Automasi FTKK',
    'Bengkel robotik asas dan automasi untuk pelajar FTKK merangkumi litar, pengaturcaraan mikro pengawal, dan demonstrasi robot mudah alih.',
    'Entrepreneurship', 'Faculty/Club', 'Physical', 'Persatuan Mahasiswa FTKK',
    'Memperkenalkan asas robotik kepada pelajar FTKK.', 'Pelajar membina prototaip robot ringkas.', 'FTKK Seminar Room',
    '2026-04-28', '2026-04-29', '09:00:00', '16:30:00', 50,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    5, 'APPROVED', 'APPROVED', 'APPROVED', '2026-04-01', '2026-04-22', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Program Ibadah dan Kepimpinan Ramadan UMT',
    'Program kerohanian bulan Ramadan merangkumi kuliah maghfirah, qiamullail, dan aktiviti bakti komuniti bersempena Ramadan.',
    'Religious', 'Faculty/Club', 'Physical', 'Kelab Kebudayaan',
    'Meningkatkan kesedaran rohani dan nilai murni dalam kalangan pelajar.', 'Pelajar mengamalkan nilai kepimpinan berteraskan akhlak.', 'Masjid UMT',
    '2026-02-18', '2026-03-18', '20:00:00', '22:30:00', 200,
    'https://images.unsplash.com/photo-1564769662533-4f00a6b40b7f?auto=format&fit=crop&w=900&q=80',
    5, 'APPROVED', 'APPROVED', 'APPROVED', '2026-02-01', '2026-02-15', @organizer_id, 'CAMPUSLINK_SEED_V9'
),
(
    'Latihan Sukarelawan Kesiapsiagaan Bencana',
    'Latihan kesiapsiagaan bencana dan pertolongan cemas untuk sukarelawan kampus dengan kerjasama agensi tempatan di Kompleks Sukan Gong Badak.',
    'Volunteerism', 'Faculty/Club', 'Physical', 'Kelab Sukarelawan UMT',
    'Melatih sukarelawan kampus dalam tindak balas kecemasan.', 'Sukarelawan mahir prosedur asas pertolongan cemas.', 'Kompleks Sukan Gong Badak',
    '2026-05-09', '2026-05-10', '08:00:00', '17:00:00', 70,
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
    5, 'APPROVED', 'APPROVED', 'APPROVED', '2026-04-10', '2026-05-05', @organizer_id, 'CAMPUSLINK_SEED_V9'
);

-- SDG mappings
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 4 FROM programme WHERE title = 'Kemahiran Kepimpinan PRS UMT 2026' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 9 FROM programme WHERE title = 'Simposium Inovasi Pelajar FSKM 2026' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 3 FROM programme WHERE title = 'Karnival Sukan Inter-Fakulti UMT 2026' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 4 FROM programme WHERE title = 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 8 FROM programme WHERE title = 'Karnival Keusahawanan Siswazah Terengganu 2026' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 11 FROM programme WHERE title = 'Program Khidmat Masyarakat Negeri Terengganu' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 11 FROM programme WHERE title = 'Festival Seni dan Budaya Malaysia UMT 2026' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 17 FROM programme WHERE title = 'ASEAN Youth Leadership Summit UMT 2026' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 9 FROM programme WHERE title = 'International Research and Innovation Expo UMT' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 14 FROM programme WHERE title = 'Global Volunteer Coastal Cleanup Programme' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 13 FROM programme WHERE title = 'International Symposium on Sustainable Development Goals' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 9 FROM programme WHERE title = 'Bengkel Kemahiran Industri 4.0 FSKM' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 9 FROM programme WHERE title = 'Bengkel Robotik dan Automasi FTKK' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 16 FROM programme WHERE title = 'Program Ibadah dan Kepimpinan Ramadan UMT' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT id, 3 FROM programme WHERE title = 'Latihan Sukarelawan Kesiapsiagaan Bencana' AND sponsorship_info = 'CAMPUSLINK_SEED_V9';
