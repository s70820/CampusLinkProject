-- Demo-friendly: keep at least 5 programmes open for registration on 10 Jun 2026.
-- Mix of free, paid, and team programmes for supervisor demonstration.

UPDATE programme
SET registration_open_date = '2026-06-01'
WHERE status = 'APPROVED'
  AND title IN (
    'Karnival Keusahawanan Siswazah Terengganu 2026',
    'Program Khidmat Masyarakat Negeri Terengganu',
    'Festival Seni dan Budaya Malaysia UMT 2026',
    'Bengkel Robotik dan Automasi FTKK',
    'Karnival Sukan Inter-Fakulti UMT 2026'
  );
