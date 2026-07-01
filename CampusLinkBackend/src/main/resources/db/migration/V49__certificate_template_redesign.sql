-- Migrate legacy certificate template IDs to the new four-template set
UPDATE programme SET certificate_template = 'GEOMETRIC_MODERN'
WHERE certificate_template IN ('CLASSIC_GOLD', 'MINIMAL_GEO');

UPDATE programme SET certificate_template = 'ELEGANT_BORDER'
WHERE certificate_template = 'FORMAL_FRAME';

UPDATE programme SET certificate_template = 'LAUREL_AWARD'
WHERE certificate_template = 'ELEGANT_RIBBON';

UPDATE programme SET certificate_template = 'DIAGONAL_CONTEMPORARY'
WHERE certificate_template = 'MODERN_SEAL';

ALTER TABLE programme
    ALTER COLUMN certificate_template SET DEFAULT 'GEOMETRIC_MODERN';

ALTER TABLE programme
    ALTER COLUMN certificate_orientation SET DEFAULT 'PORTRAIT';
