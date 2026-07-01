-- Align programme categories with official UMT Kategori Program

UPDATE programme SET category = 'KEPIMPINAN' WHERE category IN ('Leadership', 'KEPIMPINAN');
UPDATE programme SET category = 'KEBUDAYAAN' WHERE category IN ('Culture', 'KEBUDAYAAN');
UPDATE programme SET category = 'KEROHANIAN' WHERE category IN ('Religious', 'Religious/Spiritual', 'KEROHANIAN');
UPDATE programme SET category = 'KEUSAHAWANAN' WHERE category IN ('Entrepreneurship', 'KEUSAHAWANAN');
UPDATE programme SET category = 'KESUKARELAWAN' WHERE category IN ('Volunteerism', 'Volunteering', 'KESUKARELAWAN');
UPDATE programme SET category = 'KERJAYA' WHERE category IN ('Career', 'STEM & Innovation', 'KERJAYA');
UPDATE programme SET category = 'SUKAN' WHERE category IN ('Sports', 'SUKAN');
UPDATE programme SET category = 'KAUNSELING DAN KESEJAHTERAAN PELAJAR'
WHERE category IN ('Counselling & Wellness', 'Wellness', 'Counselling and Student Well-being', 'KAUNSELING DAN KESEJAHTERAAN PELAJAR');
