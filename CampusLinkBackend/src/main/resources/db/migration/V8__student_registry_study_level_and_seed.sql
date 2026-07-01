-- Prototype UMT student registry (future production: replace with UMT SSO)
-- Only matric numbers in this table may register for CampusLink+.

SET @dbname = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'student_registry' AND COLUMN_NAME = 'study_level') = 0,
    'ALTER TABLE student_registry ADD COLUMN study_level VARCHAR(30) NOT NULL DEFAULT ''Degree'' AFTER faculty',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Replace prototype rows with 30 canonical UMT student records (S70001–S70030)
DELETE FROM student_registry;

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
('S70030', 'Lim Zhi Yang', 'Faculty of Maritime Studies (FPM)', 'Degree', TRUE);
