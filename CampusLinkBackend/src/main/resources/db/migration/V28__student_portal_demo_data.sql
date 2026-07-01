-- Student portal demo data: registrations, attendance, merit, certificates
-- Uses COMPLETED / published programmes only — NOT CAMPUSLINK_WORKFLOW_V24 (live MPP/HEPA demo)

CREATE TABLE IF NOT EXISTS programme_attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    session_label VARCHAR(150) NOT NULL,
    attendance_status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    checked_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_merit_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    programme_id BIGINT NOT NULL,
    programme_title VARCHAR(255) NOT NULL,
    programme_level VARCHAR(50) NOT NULL,
    merit_role_type VARCHAR(30) NOT NULL DEFAULT 'PARTICIPANT',
    role_label VARCHAR(100) NOT NULL DEFAULT 'Participant',
    merit_points INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    awarded_at DATE NOT NULL,
    CONSTRAINT fk_merit_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_merit_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_certificate (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    programme_id BIGINT NOT NULL,
    programme_title VARCHAR(255) NOT NULL,
    organizer_club VARCHAR(255) NULL,
    certificate_type VARCHAR(40) NOT NULL DEFAULT 'PARTICIPATION',
    issued_at DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'READY',
    CONSTRAINT fk_cert_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_cert_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE
);

-- Helper: completed/historical programmes (exclude workflow demo titles)
-- Kemahiran Kepimpinan PRS, Simposium Inovasi FSKM, Kejohanan Debat, Program Ibadah Ramadan,
-- International Research Expo, Global Volunteer Coastal Cleanup

-- ========== SARAH AMARA (S70462) ==========
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-03-08 10:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-04-10 09:30:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-05-28 14:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-06-02 11:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kejohanan E-Sports Inter-Fakulti UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, payment_reference, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'PENDING_PAYMENT_VERIFICATION', 'EsportsBengkel_S70462', '2026-06-05 16:20:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Bengkel Streaming & Pengurusan Komuniti E-Sports'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

-- ========== MUHAMMAD AMIRUL (S70877) ==========
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-03-09 08:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-04-12 10:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-06-01 09:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Kejohanan E-Sports Inter-Fakulti UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-06-08 13:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Festival Seni dan Budaya Malaysia UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

-- ========== SYED ALI (S70846) ==========
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-03-11 09:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70846' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-05-30 10:30:00'
FROM programme p, user u
WHERE u.matric_number = 'S70846' AND p.title = 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-07-05 11:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70846' AND p.title = 'Karnival Keusahawanan Siswazah Terengganu 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

-- ========== AHMAD ALI (S70489) ==========
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-04-14 08:30:00'
FROM programme p, user u
WHERE u.matric_number = 'S70489' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-06-03 15:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70489' AND p.title = 'Kejohanan E-Sports Inter-Fakulti UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-08-02 09:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70489' AND p.title = 'Program Khidmat Masyarakat Negeri Terengganu'
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

-- Organizer E-Sports programme: extra student registrations for demo
INSERT INTO programme_registration (programme_id, user_id, registration_type, status, created_at)
SELECT p.id, u.id, 'INDIVIDUAL', 'ACTIVE', '2026-06-04 10:00:00'
FROM programme p, user u
WHERE p.title = 'Kejohanan E-Sports Inter-Fakulti UMT 2026'
  AND u.matric_number IN ('S70001', 'S70003', 'S70008', 'S70016', 'S70022')
AND NOT EXISTS (SELECT 1 FROM programme_registration r WHERE r.programme_id = p.id AND r.user_id = u.id);

-- Attendance (completed programmes only)
INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 1 Opening', 'PRESENT', '2026-03-10 08:45:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 1 Opening');

INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 2 Workshop', 'PRESENT', '2026-03-11 09:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 2 Workshop');

INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 3 Closing', 'PRESENT', '2026-03-12 08:50:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 3 Closing');

INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 1 Symposium', 'PRESENT', '2026-04-14 09:10:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 1 Symposium');

INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 2 Pitching', 'PRESENT', '2026-04-15 09:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 2 Pitching');

INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Final Round', 'PRESENT', '2026-06-09 14:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Final Round');

-- Amirul attendance
INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 1 Opening', 'PRESENT', '2026-03-10 08:50:00'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 1 Opening');

INSERT INTO programme_attendance (programme_id, user_id, session_label, attendance_status, checked_in_at)
SELECT p.id, u.id, 'Day 1 Symposium', 'PRESENT', '2026-04-14 09:00:00'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM programme_attendance a WHERE a.programme_id = p.id AND a.user_id = u.id AND a.session_label = 'Day 1 Symposium');

-- Merit records (completed programmes)
INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-03-12'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-04-15'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-06-10'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-03-12'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-04-15'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-03-12'
FROM programme p, user u
WHERE u.matric_number = 'S70846' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-06-10'
FROM programme p, user u
WHERE u.matric_number = 'S70846' AND p.title = 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

INSERT INTO student_merit_record (user_id, programme_id, programme_title, programme_level, merit_role_type, role_label, merit_points, academic_year, semester, status, awarded_at)
SELECT u.id, p.id, p.title, p.programme_level, 'PARTICIPANT', 'Participant', p.merit_points, '2026', 'Semester 1', 'COMPLETED', '2026-04-15'
FROM programme p, user u
WHERE u.matric_number = 'S70489' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM student_merit_record m WHERE m.user_id = u.id AND m.programme_id = p.id);

-- Certificates for completed programmes
INSERT INTO student_certificate (user_id, programme_id, programme_title, organizer_club, certificate_type, issued_at, status)
SELECT u.id, p.id, p.title, p.organizer_club, 'PARTICIPATION', '2026-03-15', 'READY'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM student_certificate c WHERE c.user_id = u.id AND c.programme_id = p.id);

INSERT INTO student_certificate (user_id, programme_id, programme_title, organizer_club, certificate_type, issued_at, status)
SELECT u.id, p.id, p.title, p.organizer_club, 'PARTICIPATION', '2026-04-18', 'READY'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM student_certificate c WHERE c.user_id = u.id AND c.programme_id = p.id);

INSERT INTO student_certificate (user_id, programme_id, programme_title, organizer_club, certificate_type, issued_at, status)
SELECT u.id, p.id, p.title, p.organizer_club, 'PARTICIPATION', '2026-06-12', 'READY'
FROM programme p, user u
WHERE u.matric_number = 'S70462' AND p.title = 'Kejohanan Debat Antara Universiti Peringkat Kebangsaan'
AND NOT EXISTS (SELECT 1 FROM student_certificate c WHERE c.user_id = u.id AND c.programme_id = p.id);

INSERT INTO student_certificate (user_id, programme_id, programme_title, organizer_club, certificate_type, issued_at, status)
SELECT u.id, p.id, p.title, p.organizer_club, 'PARTICIPATION', '2026-03-15', 'READY'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Kemahiran Kepimpinan PRS UMT 2026'
AND NOT EXISTS (SELECT 1 FROM student_certificate c WHERE c.user_id = u.id AND c.programme_id = p.id);

INSERT INTO student_certificate (user_id, programme_id, programme_title, organizer_club, certificate_type, issued_at, status)
SELECT u.id, p.id, p.title, p.organizer_club, 'PARTICIPATION', '2026-04-18', 'READY'
FROM programme p, user u
WHERE u.matric_number = 'S70877' AND p.title = 'Simposium Inovasi Pelajar FSKM 2026'
AND NOT EXISTS (SELECT 1 FROM student_certificate c WHERE c.user_id = u.id AND c.programme_id = p.id);
