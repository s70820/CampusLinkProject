-- Fix unrealistic demo phone numbers and display names for bulk-seeded students (V52).

UPDATE user u
SET phone_number = CONCAT(
    '01',
    IF(MOD(CAST(SUBSTRING(u.matric_number, 3) AS UNSIGNED), 2) = 0, '12', '11'),
    LPAD(MOD(CAST(SUBSTRING(u.matric_number, 3) AS UNSIGNED) * 917, 10000000), 7, '0')
)
WHERE u.matric_number REGEXP '^S701[0-9]{2}$'
  AND (u.phone_number IS NULL OR u.phone_number REGEXP '^0101[0-9]{2}$');

UPDATE user
SET full_name = TRIM(REPLACE(full_name, ' (Demo)', ''))
WHERE full_name LIKE '% (Demo)%';

UPDATE student_registry
SET full_name = TRIM(REPLACE(full_name, ' (Demo)', ''))
WHERE full_name LIKE '% (Demo)%';

-- Give S70101–S70110 distinct names (many were duplicated as "Siti Lim").
UPDATE user u
INNER JOIN (
    SELECT 'S70101' AS matric, 'Nur Aisyah binti Rahman' AS full_name UNION ALL
    SELECT 'S70102', 'Ahmad Hakim bin Ismail' UNION ALL
    SELECT 'S70103', 'Lee Wei Ming' UNION ALL
    SELECT 'S70104', 'Siti Nurhaliza binti Omar' UNION ALL
    SELECT 'S70105', 'Raj Kumar a/l Muthusamy' UNION ALL
    SELECT 'S70106', 'Wong Mei Ling' UNION ALL
    SELECT 'S70107', 'Muhammad Faris bin Abdullah' UNION ALL
    SELECT 'S70108', 'Tan Jia Hui' UNION ALL
    SELECT 'S70109', 'Nurul Izzati binti Hassan' UNION ALL
    SELECT 'S70110', 'Arif bin Zulkifli'
) n ON n.matric = u.matric_number
SET u.full_name = n.full_name;

UPDATE student_registry sr
INNER JOIN (
    SELECT 'S70101' AS matric, 'Nur Aisyah binti Rahman' AS full_name UNION ALL
    SELECT 'S70102', 'Ahmad Hakim bin Ismail' UNION ALL
    SELECT 'S70103', 'Lee Wei Ming' UNION ALL
    SELECT 'S70104', 'Siti Nurhaliza binti Omar' UNION ALL
    SELECT 'S70105', 'Raj Kumar a/l Muthusamy' UNION ALL
    SELECT 'S70106', 'Wong Mei Ling' UNION ALL
    SELECT 'S70107', 'Muhammad Faris bin Abdullah' UNION ALL
    SELECT 'S70108', 'Tan Jia Hui' UNION ALL
    SELECT 'S70109', 'Nurul Izzati binti Hassan' UNION ALL
    SELECT 'S70110', 'Arif bin Zulkifli'
) n ON n.matric = sr.matric_number
SET sr.full_name = n.full_name;
