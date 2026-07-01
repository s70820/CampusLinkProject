-- V52 bulk-registered demo students as INDIVIDUAL on programmes that are now team-based.
-- Remove those invalid rows so students (especially Sarah) can test team registration.

DELETE r FROM programme_registration r
INNER JOIN programme p ON p.id = r.programme_id
WHERE p.is_team_programme = TRUE
  AND (r.registration_type IS NULL OR r.registration_type = 'INDIVIDUAL')
  AND r.team_registration_id IS NULL;

-- Ensure team programmes stay open for demo registration.
UPDATE programme
SET
    is_team_programme = TRUE,
    team_name_required = TRUE,
    registration_open_date = '2026-06-01'
WHERE title IN (
    'Kompetisi Mini Sumo Robot FSKM 2026',
    'Kejohanan RoboRace Inter-Fakulti UMT 2026',
    'Karnival Sukan Inter-Fakulti UMT 2026'
)
  AND status = 'APPROVED';

UPDATE programme
SET min_team_size = 3, max_team_size = 3
WHERE title = 'Kompetisi Mini Sumo Robot FSKM 2026';

UPDATE programme
SET min_team_size = 4, max_team_size = 6
WHERE title = 'Kejohanan RoboRace Inter-Fakulti UMT 2026';

UPDATE programme
SET min_team_size = 5, max_team_size = 11
WHERE title = 'Karnival Sukan Inter-Fakulti UMT 2026';
