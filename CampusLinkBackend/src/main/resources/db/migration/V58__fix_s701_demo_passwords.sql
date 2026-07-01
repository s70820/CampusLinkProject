-- V52 bulk students were seeded with a BCrypt hash for sarah123, not demo123.
-- Align S701xx demo accounts with the standard demo password used at login bootstrap.

UPDATE user
SET password_hash = (
    SELECT password_hash FROM (SELECT password_hash FROM user WHERE email = 's70001.demo@gmail.com' LIMIT 1) AS ref
)
WHERE email REGEXP '^s701[0-9]{2}\\.demo@gmail\\.com$'
  AND EXISTS (SELECT 1 FROM user WHERE email = 's70001.demo@gmail.com');
