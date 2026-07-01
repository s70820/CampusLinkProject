-- Realistic UMT role users (intended password: demo123 - corrected on startup by DemoAccountPasswordBootstrap)

INSERT INTO student_registry (matric_number, full_name, faculty, study_level, is_active) VALUES
('S71001', 'Ahmad Zaki bin Ismail', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S71002', 'Lim Mei Ling', 'Faculty of Ocean Engineering Technology (FTKK)', 'Degree', TRUE),
('S71003', 'Priya a/p Rajendran', 'Faculty of Fisheries and Food Science (FPSM)', 'Degree', TRUE),
('S71004', 'Muhammad Danial bin Omar', 'Faculty of Science and Marine Environment (FSSM)', 'Degree', TRUE),
('S71005', 'Wong Jia Hui', 'Faculty of Business, Economics and Social Development (FPEPS)', 'Degree', TRUE),
('S71006', 'Siti Aminah binti Rahman', 'Faculty of Maritime Studies (FPM)', 'Degree', TRUE),
('S71007', 'Tan Boon Kiat', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S71008', 'Kavitha a/p Maniam', 'Faculty of Ocean Engineering Technology (FTKK)', 'Degree', TRUE),
('S72001', 'Nurul Hafizah binti Azman', 'Faculty of Business, Economics and Social Development (FPEPS)', 'Degree', TRUE),
('S72002', 'Goh Wei Jie', 'Faculty of Computer Science and Mathematics (FSKM)', 'Degree', TRUE),
('S72003', 'Arun a/l Prakash', 'Faculty of Maritime Studies (FPM)', 'Degree', TRUE),
('S72004', 'Fatimah binti Salleh', 'Faculty of Fisheries and Food Science (FPSM)', 'Degree', TRUE),
('S72005', 'Chong Kah Wai', 'Faculty of Science and Marine Environment (FSSM)', 'Degree', TRUE)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    faculty = VALUES(faculty),
    study_level = VALUES(study_level),
    is_active = VALUES(is_active);

INSERT IGNORE INTO user (full_name, email, password_hash, matric_number, role, approval_status, faculty, phone_number, ic_number) VALUES
('Norazila binti Ahmad', 'hepa.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', NULL, 'HEPA', NULL, NULL, '0398765432', '800101015199'),
('Siti Rahayu binti Mohd Zain', 'hepa2.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', NULL, 'HEPA', NULL, NULL, '0398765433', '820215025202'),
('Mohd Firdaus bin Hassan', 'hepa3.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', NULL, 'HEPA', NULL, NULL, '0398765434', '850320035303'),
('Nurul Hafizah binti Azman', 'mpp1.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S72001', 'MPP', 'APPROVED', 'Faculty of Business, Economics and Social Development (FPEPS)', '0145678901', '910101015101'),
('Goh Wei Jie', 'mpp2.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S72002', 'MPP', 'APPROVED', 'Faculty of Computer Science and Mathematics (FSKM)', '0145678902', '920202025102'),
('Arun a/l Prakash', 'mpp3.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S72003', 'MPP', 'APPROVED', 'Faculty of Maritime Studies (FPM)', '0145678903', '930303035103'),
('Fatimah binti Salleh', 'mpp4.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S72004', 'MPP', 'APPROVED', 'Faculty of Fisheries and Food Science (FPSM)', '0145678904', '940404045104'),
('Chong Kah Wai', 'mpp5.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S72005', 'MPP', 'APPROVED', 'Faculty of Science and Marine Environment (FSSM)', '0145678905', '950505055105'),
('Ahmad Zaki bin Ismail', 'organizer1.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S71001', 'ORGANIZER', 'APPROVED', 'Faculty of Computer Science and Mathematics (FSKM)', '0134567801', '900101015001'),
('Lim Mei Ling', 'organizer2.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S71002', 'ORGANIZER', 'APPROVED', 'Faculty of Ocean Engineering Technology (FTKK)', '0134567802', '920202025002'),
('Priya a/p Rajendran', 'organizer3.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S71003', 'ORGANIZER', 'APPROVED', 'Faculty of Fisheries and Food Science (FPSM)', '0134567803', '930303035003'),
('Muhammad Danial bin Omar', 'organizer4.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S71004', 'ORGANIZER', 'APPROVED', 'Faculty of Science and Marine Environment (FSSM)', '0134567804', '940404045004'),
('Wong Jia Hui', 'organizer5.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S71005', 'ORGANIZER', 'APPROVED', 'Faculty of Business, Economics and Social Development (FPEPS)', '0134567805', '950505055005'),
('Siti Aminah binti Rahman', 'organizer6.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S71006', 'ORGANIZER', 'APPROVED', 'Faculty of Maritime Studies (FPM)', '0134567806', '960606065006'),
('Tan Boon Kiat', 'organizer7.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S71007', 'ORGANIZER', 'APPROVED', 'Faculty of Computer Science and Mathematics (FSKM)', '0134567807', '970707075007'),
('Kavitha a/p Maniam', 'organizer8.demo@gmail.com', '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW', 'S71008', 'ORGANIZER', 'APPROVED', 'Faculty of Ocean Engineering Technology (FTKK)', '0134567808', '980808085008');
