-- Fix missing, broken local, dead Unsplash, and duplicate programme posters for browse cards.

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Kompetisi Mini Sumo Robot FSKM 2026';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Kejohanan RoboRace Inter-Fakulti UMT 2026';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Bengkel Robotik dan Automasi FTKK';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Bengkel Robotik Lanjutan';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Football Tournament';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Robotic Workshop STEM FSKM 2026';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80'
WHERE title = 'International Research and Innovation Expo UMT';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Festival Seni dan Budaya Malaysia UMT 2026';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Bengkel Percetakan 3D untuk Komponen Robot';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80'
WHERE title = 'STEM Outreach: Robotik untuk Pelajar Sekolah Menengah';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Kursus Penyediaan Pasukan RoboCup Malaysia';

UPDATE programme SET poster_path = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80'
WHERE title = 'Karnival Robot Gergasi UMT';

-- Dead Unsplash image used in several seeds.
UPDATE programme
SET poster_path = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80'
WHERE poster_path LIKE '%photo-1532094344004%'
  AND title NOT IN ('International Research and Innovation Expo UMT', 'STEM Outreach: Robotik untuk Pelajar Sekolah Menengah', 'Kursus Penyediaan Pasukan RoboCup Malaysia');

-- Uploaded poster files are not shipped with the repo; fall back to stable remote images.
UPDATE programme
SET poster_path = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80'
WHERE poster_path LIKE '/uploads/posters/%'
  AND title NOT IN ('Robotic Workshop STEM FSKM 2026', 'Bengkel Percetakan 3D untuk Komponen Robot');

UPDATE programme
SET poster_path = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80'
WHERE poster_path IS NULL OR TRIM(poster_path) = '';
