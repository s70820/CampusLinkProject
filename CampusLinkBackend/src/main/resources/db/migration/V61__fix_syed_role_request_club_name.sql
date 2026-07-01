-- Syed's seeded APPROVED organizer request was missing club_name, which blocked login.

UPDATE role_request rr
INNER JOIN user u ON u.id = rr.user_id
SET rr.club_name = 'Persatuan Mahasiswa FTKK'
WHERE u.email = 'syed.demo@gmail.com'
  AND rr.requested_role = 'ORGANIZER'
  AND rr.status = 'APPROVED'
  AND (rr.club_name IS NULL OR TRIM(rr.club_name) = '');
