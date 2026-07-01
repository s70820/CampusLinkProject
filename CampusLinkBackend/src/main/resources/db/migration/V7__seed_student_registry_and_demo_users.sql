-- Prototype student registry (future production: replace with UMT SSO identity verification)
INSERT INTO student_registry (matric_number, full_name, faculty, is_active)
VALUES
    ('S70877', 'Muhammad Amirul', 'Faculty of Computer Science and Mathematics (FSKM)', TRUE),
    ('S70846', 'Syed Ali', 'Faculty of Computer Science and Mathematics (FSKM)', TRUE),
    ('S70462', 'Sarah Amara', 'Faculty of Computer Science and Mathematics (FSKM)', TRUE),
    ('S50908', 'Muhammad Abu', 'Faculty of Computer Science and Mathematics (FSKM)', TRUE),
    ('S70489', 'Ahmad Ali', 'Faculty of Computer Science and Mathematics (FSKM)', TRUE),
    ('S70980', 'Safwan Haikal', 'Faculty of Computer Science and Mathematics (FSKM)', TRUE),
    ('S12345', 'Demo Student', 'Faculty of Computer Science and Mathematics (FSKM)', TRUE)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    faculty = VALUES(faculty),
    is_active = VALUES(is_active);

-- Update existing demo accounts to personal emails and BCrypt password hashes
UPDATE user SET
    email = 'amirul.demo@gmail.com',
    full_name = 'Muhammad Amirul',
    phone_number = '0115464788',
    ic_number = '050718115013',
    faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    password_hash = '$2a$10$CI4TUPdsu2PYqEoenS0xEu7aQPaExvgt8sT/ar4f7/DaT4XvescLC'
WHERE matric_number = 'S70877';

UPDATE user SET
    email = 'syed.demo@gmail.com',
    full_name = 'Syed Ali',
    phone_number = '0145457898',
    ic_number = '040215114007',
    faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    password_hash = '$2a$10$A3B0K3vzNTpHCQBSErP9tOaDT0Le8Hdc7U2s/yxhXCMyKC8C5kOam'
WHERE matric_number = 'S70846';

UPDATE user SET
    email = 'sarah.demo@gmail.com',
    full_name = 'Sarah Amara',
    phone_number = '0186728846',
    ic_number = '030525108024',
    faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    password_hash = '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW'
WHERE matric_number = 'S70462';

UPDATE user SET
    email = 'abu.demo@gmail.com',
    full_name = 'Muhammad Abu',
    faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    password_hash = '$2a$10$Pp3SxSn1ZgNGpO2mlokXWuyqQ29wvyilTRlVE/oMz18SRp8Gnn1tS'
WHERE matric_number = 'S50908';

UPDATE user SET
    email = 'ahmad.demo@gmail.com',
    full_name = 'Ahmad Ali',
    phone_number = '0123456789',
    ic_number = '021106118027',
    faculty = 'Faculty of Computer Science and Mathematics (FSKM)',
    password_hash = '$2a$10$c01ERlfbK8W6I.2MBz6MO.mYFzQQGwaib7D5MQQy1Ujr/Nho09JJy'
WHERE matric_number = 'S70489';

-- Migrate any remaining ocean.umt.edu.my emails to personal-style demo emails by matric
UPDATE user SET email = CONCAT(LOWER(matric_number), '.demo@gmail.com')
WHERE email LIKE '%@ocean.umt.edu.my';

-- Re-hash any remaining plaintext demo passwords (6+ chars, not BCrypt)
UPDATE user SET password_hash = '$2a$10$CI4TUPdsu2PYqEoenS0xEu7aQPaExvgt8sT/ar4f7/DaT4XvescLC'
WHERE password_hash IS NOT NULL
  AND password_hash NOT LIKE '$2a$%'
  AND matric_number = 'S70877';

UPDATE user SET password_hash = '$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW'
WHERE password_hash IS NOT NULL
  AND password_hash NOT LIKE '$2a$%'
  AND matric_number = 'S70462';

UPDATE user SET password_hash = '$2a$10$A3B0K3vzNTpHCQBSErP9tOaDT0Le8Hdc7U2s/yxhXCMyKC8C5kOam'
WHERE password_hash IS NOT NULL
  AND password_hash NOT LIKE '$2a$%'
  AND matric_number = 'S70846';
