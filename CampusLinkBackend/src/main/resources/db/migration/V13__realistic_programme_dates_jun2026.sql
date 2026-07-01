-- Align programme calendar with current demo date (10 Jun 2026).
-- Past programmes become COMPLETED (historical records only).
-- Future programmes start from August 2026 with realistic registration windows.

UPDATE programme
SET status = 'COMPLETED',
    completed_at = COALESCE(completed_at, NOW())
WHERE status = 'APPROVED'
  AND (
    (end_date IS NOT NULL AND end_date < '2026-06-10')
    OR (registration_close_date IS NOT NULL AND registration_close_date < '2026-06-10')
    OR (start_date IS NOT NULL AND start_date < '2026-08-01'
        AND title NOT IN (
            'Karnival Keusahawanan Siswazah Terengganu 2026',
            'Program Khidmat Masyarakat Negeri Terengganu'
        ))
  );

UPDATE programme
SET
    start_date = '2026-08-06',
    end_date = '2026-08-08',
    registration_open_date = '2026-06-15',
    registration_close_date = '2026-07-28'
WHERE title = 'Karnival Keusahawanan Siswazah Terengganu 2026'
  AND status = 'APPROVED';

UPDATE programme
SET
    registration_open_date = '2026-07-01',
    registration_close_date = '2026-08-05'
WHERE title = 'Program Khidmat Masyarakat Negeri Terengganu'
  AND status = 'APPROVED';

UPDATE programme
SET
    start_date = '2026-09-05',
    end_date = '2026-09-05',
    registration_open_date = '2026-08-01',
    registration_close_date = '2026-09-01',
    status = 'APPROVED',
    completed_at = NULL
WHERE title = 'Bengkel Robotik dan Automasi FTKK';

UPDATE programme
SET
    start_date = '2026-09-12',
    end_date = '2026-09-12',
    registration_open_date = '2026-08-01',
    registration_close_date = '2026-09-08',
    status = 'APPROVED',
    completed_at = NULL
WHERE title = 'Bengkel Robotik Lanjutan';

UPDATE programme
SET
    start_date = '2026-10-18',
    end_date = '2026-10-20',
    registration_open_date = '2026-09-01',
    registration_close_date = '2026-10-10',
    is_team_programme = TRUE,
    min_team_size = 5,
    max_team_size = 11,
    status = 'APPROVED',
    completed_at = NULL
WHERE title = 'Karnival Sukan Inter-Fakulti UMT 2026';

UPDATE programme
SET
    start_date = '2026-10-25',
    end_date = '2026-10-27',
    registration_open_date = '2026-09-01',
    registration_close_date = '2026-10-18',
    is_team_programme = TRUE,
    min_team_size = 7,
    max_team_size = 12,
    status = 'APPROVED',
    completed_at = NULL
WHERE title = 'Football Tournament';

UPDATE programme
SET status = 'COMPLETED', completed_at = COALESCE(completed_at, NOW())
WHERE title IN ('Leadership Bootcamp', 'Test Programme')
  AND status = 'APPROVED';
