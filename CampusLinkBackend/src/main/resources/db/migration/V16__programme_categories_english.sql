-- Official UMT programme categories in English

UPDATE programme SET category = 'Leadership' WHERE category IN ('KEPIMPINAN', 'Leadership');
UPDATE programme SET category = 'Culture' WHERE category IN ('KEBUDAYAAN', 'Culture');
UPDATE programme SET category = 'Religious/Spirituality' WHERE category IN ('KEROHANIAN', 'Religious', 'Religious/Spiritual');
UPDATE programme SET category = 'Entrepreneurship' WHERE category IN ('KEUSAHAWANAN', 'Entrepreneurship');
UPDATE programme SET category = 'Volunteerism' WHERE category IN ('KESUKARELAWAN', 'Volunteerism', 'Volunteering');
UPDATE programme SET category = 'Career' WHERE category IN ('KERJAYA', 'Career', 'STEM & Innovation');
UPDATE programme SET category = 'Sports' WHERE category IN ('SUKAN', 'Sports');
UPDATE programme SET category = 'Counselling and Student Well-being'
WHERE category IN ('KAUNSELING DAN KESEJAHTERAAN PELAJAR', 'Counselling & Wellness', 'Wellness');
