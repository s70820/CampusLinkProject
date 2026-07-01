-- Students with an approved ORGANIZER request may still be STUDENT when a seeded demo
-- secretary occupies the club slot. Assign the approved student and free the demo account.

UPDATE club c
INNER JOIN role_request rr ON LOWER(TRIM(rr.club_name)) = LOWER(c.name)
    AND rr.requested_role = 'ORGANIZER'
    AND rr.status = 'APPROVED'
    AND rr.club_name IS NOT NULL
    AND TRIM(rr.club_name) <> ''
INNER JOIN user u ON u.id = rr.user_id AND u.role = 'STUDENT'
INNER JOIN user demo ON LOWER(TRIM(demo.club_name)) = LOWER(c.name)
    AND demo.role = 'ORGANIZER'
    AND demo.approval_status = 'APPROVED'
    AND demo.email LIKE 'organizer%.demo@gmail.com'
SET c.secretary_user_id = u.id;

UPDATE user u
INNER JOIN role_request rr ON rr.user_id = u.id
    AND rr.requested_role = 'ORGANIZER'
    AND rr.status = 'APPROVED'
    AND rr.club_name IS NOT NULL
    AND TRIM(rr.club_name) <> ''
INNER JOIN club c ON LOWER(TRIM(c.name)) = LOWER(TRIM(rr.club_name))
INNER JOIN user demo ON LOWER(TRIM(demo.club_name)) = LOWER(c.name)
    AND demo.role = 'ORGANIZER'
    AND demo.email LIKE 'organizer%.demo@gmail.com'
SET u.role = 'ORGANIZER',
    u.approval_status = 'APPROVED',
    u.club_id = c.id,
    u.club_name = c.name
WHERE u.role = 'STUDENT';

UPDATE user demo
INNER JOIN user u ON u.role = 'ORGANIZER'
    AND u.email NOT LIKE 'organizer%.demo@gmail.com'
    AND LOWER(TRIM(u.club_name)) = LOWER(TRIM(demo.club_name))
SET demo.role = 'STUDENT',
    demo.approval_status = 'APPROVED',
    demo.club_id = NULL,
    demo.club_name = NULL
WHERE demo.role = 'ORGANIZER'
  AND demo.email LIKE 'organizer%.demo@gmail.com';
