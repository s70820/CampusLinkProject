-- Run on Kerocket MySQL if demo logins return HTTP 403 after a manual DB import.
-- Safe to re-run; only touches known presentation demo emails.
--
-- MySQL Workbench "Safe Updates" (Error 1175): use email = '...' or id = ... in WHERE
-- (not LOWER(email)), OR uncheck Edit → Preferences → SQL Editor → Safe Updates.

USE app;

-- Fix Sarah only (run this first if you just need one login working)
UPDATE user
SET role = 'STUDENT',
    approval_status = 'APPROVED',
    club_id = NULL,
    club_name = NULL
WHERE email = 'sarahdemo335@gmail.com';

-- Other student demo accounts
UPDATE user
SET role = 'STUDENT',
    approval_status = 'APPROVED',
    club_id = NULL,
    club_name = NULL
WHERE email IN (
    'sarah.demo@gmail.com',
    'amirul.demo@gmail.com',
    'syed.demo@gmail.com',
    'ahmad.demo@gmail.com',
    'abu.demo@gmail.com',
    'safwan.demo@gmail.com'
);

-- Organizer / MPP / HEPA demo accounts (password reset happens on app restart via bootstrap)
UPDATE user
SET approval_status = 'APPROVED'
WHERE email IN (
    'organizer1.demo@gmail.com',
    'organizer2.demo@gmail.com',
    'organizer3.demo@gmail.com',
    'organizer4.demo@gmail.com',
    'organizer5.demo@gmail.com',
    'organizer6.demo@gmail.com',
    'organizer7.demo@gmail.com',
    'organizer8.demo@gmail.com',
    'mpp1.demo@gmail.com',
    'mpp2.demo@gmail.com',
    'mpp3.demo@gmail.com',
    'mpp4.demo@gmail.com',
    'mpp5.demo@gmail.com',
    'hepa.demo@gmail.com',
    'hepa2.demo@gmail.com',
    'hepa3.demo@gmail.com'
);

-- Verify Sarah is sign-in ready
SELECT id, email, role, approval_status, club_name
FROM user
WHERE email = 'sarahdemo335@gmail.com';
