INSERT INTO merit_rule (programme_level, role_type, merit_points) VALUES
('International', 'SPECIAL_CONTRIBUTION', 80),
('National', 'SPECIAL_CONTRIBUTION', 50),
('State', 'SPECIAL_CONTRIBUTION', 40),
('University', 'SPECIAL_CONTRIBUTION', 20),
('Faculty/Club', 'SPECIAL_CONTRIBUTION', 20)
ON DUPLICATE KEY UPDATE merit_points = VALUES(merit_points);
