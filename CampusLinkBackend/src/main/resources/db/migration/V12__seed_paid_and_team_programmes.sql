-- Demo programmes for paid and team registration workflows

UPDATE programme
SET
    is_paid = TRUE,
    registration_fee = 25.00,
    payment_instructions = 'Transfer RM25.00 to Maybank 5123-4567-8901 (UMT Robotics Club). Use the reference format below and upload your receipt.',
    payment_reference_format = 'BengkelRobotik_MatricNumber',
    is_team_programme = FALSE
WHERE title = 'Bengkel Robotik dan Automasi FTKK';

UPDATE programme
SET
    is_paid = FALSE,
    is_team_programme = TRUE,
    team_name_required = TRUE,
    min_team_size = 5,
    max_team_size = 11
WHERE title = 'Karnival Sukan Inter-Fakulti UMT 2026';

UPDATE programme
SET
    is_paid = FALSE,
    is_team_programme = TRUE,
    team_name_required = TRUE,
    min_team_size = 7,
    max_team_size = 12
WHERE title = 'Football Tournament';

INSERT INTO programme (
    title, description, category, programme_level, programme_type,
    organizer_club, venue, start_date, end_date, start_time, end_time,
    expected_participants, merit_points, status, mpp_status, hepa_status,
    organizer_id, registration_open_date, registration_close_date,
    is_paid, registration_fee, payment_instructions, payment_reference_format,
    is_team_programme, team_name_required, min_team_size, max_team_size
)
SELECT
    'Bengkel Robotik Lanjutan',
    'Hands-on advanced robotics workshop with kit fee. Payment verification required before confirmation.',
    'STEM & Innovation',
    'Faculty',
    'Workshop',
    'Robotics & AI Club',
    'Makmal Robotik FSKM',
    DATE_ADD(CURDATE(), INTERVAL 21 DAY),
    DATE_ADD(CURDATE(), INTERVAL 21 DAY),
    '09:00:00',
    '17:00:00',
    40,
    8,
    'APPROVED',
    'APPROVED',
    'APPROVED',
    organizer_id,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 14 DAY),
    TRUE,
    35.00,
    'Pay RM35 via FPX to UMT Robotics Club account. Upload receipt after payment.',
    'RobotikLanjutan_MatricNumber',
    FALSE,
    TRUE,
    NULL,
    NULL
FROM programme
WHERE title = 'Bengkel Robotik dan Automasi FTKK'
  AND NOT EXISTS (SELECT 1 FROM programme WHERE title = 'Bengkel Robotik Lanjutan')
LIMIT 1;
