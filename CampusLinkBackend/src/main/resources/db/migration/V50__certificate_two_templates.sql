-- Consolidate to two certificate templates
UPDATE programme SET certificate_template = 'GEOMETRIC_MODERN'
WHERE certificate_template IN ('ELEGANT_BORDER', 'DIAGONAL_CONTEMPORARY', 'FORMAL_FRAME', 'MODERN_SEAL', 'CLASSIC_GOLD', 'MINIMAL_GEO');

UPDATE programme SET certificate_template = 'LAUREL_AWARD'
WHERE certificate_template IN ('ELEGANT_RIBBON');
