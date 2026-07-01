-- Enable realistic team programmes with registration open for FYP demo (Jun 2026).

-- Mini Sumo: described as 2–3 person teams; configure as 3-member teams (leader + 2 teammates).
UPDATE programme
SET
    is_team_programme = TRUE,
    team_name_required = TRUE,
    min_team_size = 3,
    max_team_size = 3,
    registration_open_date = '2026-06-01',
    registration_close_date = '2026-10-18'
WHERE title = 'Kompetisi Mini Sumo Robot FSKM 2026';

-- Karnival Sukan: existing team programme (5–11 members); open registration earlier for demo.
UPDATE programme
SET
    is_team_programme = TRUE,
    team_name_required = TRUE,
    min_team_size = 5,
    max_team_size = 11,
    registration_open_date = '2026-06-01',
    registration_close_date = '2026-10-10',
    status = 'APPROVED',
    completed_at = NULL
WHERE title = 'Karnival Sukan Inter-Fakulti UMT 2026';

-- RoboRace: team competition — approve for student browse and enable team registration.
UPDATE programme
SET
    status = 'APPROVED',
    mpp_status = 'APPROVED',
    hepa_status = 'APPROVED',
    is_team_programme = TRUE,
    team_name_required = TRUE,
    min_team_size = 4,
    max_team_size = 6,
    registration_open_date = '2026-06-01',
    registration_close_date = '2026-08-18',
    completed_at = NULL
WHERE title = 'Kejohanan RoboRace Inter-Fakulti UMT 2026'
  AND sponsorship_info = 'CAMPUSLINK_DEMO_V46';

INSERT INTO advisor_approval (programme_id, advisor_name, advisor_email, approval_method, status, remarks, approved_at)
SELECT
    p.id,
    'Dr. Ahmad Faizal bin Ismail',
    'ahmad.faizal@umt.edu.my',
    'SIGNED_PDF',
    'APPROVED',
    'Robotics competition proposal verified by club advisor.',
    NOW() - INTERVAL 3 DAY
FROM programme p
WHERE p.title = 'Kejohanan RoboRace Inter-Fakulti UMT 2026'
  AND p.status = 'APPROVED'
  AND NOT EXISTS (SELECT 1 FROM advisor_approval aa WHERE aa.programme_id = p.id);
