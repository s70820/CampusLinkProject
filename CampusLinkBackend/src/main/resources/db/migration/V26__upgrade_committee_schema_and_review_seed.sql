-- Align legacy programme_committee table with MyStar workflow entity, then seed review demo data

SET @dbname = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'full_name') = 0,
    'ALTER TABLE programme_committee ADD COLUMN full_name VARCHAR(255) NULL AFTER matric_number',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'faculty') = 0,
    'ALTER TABLE programme_committee ADD COLUMN faculty VARCHAR(150) NULL AFTER full_name',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'committee_role') = 0,
    'ALTER TABLE programme_committee ADD COLUMN committee_role VARCHAR(50) NULL AFTER faculty',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'merit_role_type') = 0,
    'ALTER TABLE programme_committee ADD COLUMN merit_role_type VARCHAR(30) NULL AFTER committee_role',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'has_campuslink_account') = 0,
    'ALTER TABLE programme_committee ADD COLUMN has_campuslink_account BOOLEAN DEFAULT FALSE AFTER merit_points',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'student_id') = 0,
    'ALTER TABLE programme_committee ADD COLUMN student_id BIGINT NULL AFTER programme_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill from legacy member_name / position columns when present
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'member_name') > 0,
    'UPDATE programme_committee SET full_name = member_name WHERE full_name IS NULL OR full_name = ''''',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'position') > 0,
    'UPDATE programme_committee SET committee_role = CASE
        WHEN position LIKE ''%Director%'' OR position LIKE ''%Pengarah%'' THEN ''PENGARAH_PROGRAM''
        WHEN position LIKE ''%AJK%'' OR position LIKE ''%Committee%'' THEN ''AJK_PROGRAM''
        WHEN position LIKE ''%Special%'' OR position LIKE ''%Khas%'' THEN ''SPECIAL_CONTRIBUTION''
        ELSE ''MT_PROGRAM''
    END WHERE committee_role IS NULL OR committee_role = ''''',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE programme_committee
SET faculty = COALESCE(NULLIF(faculty, ''), 'Faculty of Computer Science and Mathematics (FSKM)')
WHERE faculty IS NULL OR faculty = '';

UPDATE programme_committee
SET merit_role_type = CASE committee_role
    WHEN 'PENGARAH_PROGRAM' THEN 'DIRECTOR'
    WHEN 'AJK_PROGRAM' THEN 'AJK'
    WHEN 'SPECIAL_CONTRIBUTION' THEN 'SPECIAL_CONTRIBUTION'
    ELSE 'MT'
END
WHERE merit_role_type IS NULL OR merit_role_type = '';

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'member_name') > 0,
    'ALTER TABLE programme_committee MODIFY member_name VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'programme_committee' AND COLUMN_NAME = 'position') > 0,
    'ALTER TABLE programme_committee MODIFY position VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Demo committee / SDG / advisor / document data for workflow programmes
INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70877', 'Muhammad Amirul bin Hassan', 'Faculty of Computer Science and Mathematics (FSKM)', 'PENGARAH_PROGRAM', 'DIRECTOR', 15, TRUE, NULL
FROM programme p WHERE p.title = 'MLBB Campus League Qualifier UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_committee pc WHERE pc.programme_id = p.id);

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70123', 'Nur Aisyah binti Rahman', 'Faculty of Computer Science and Mathematics (FSKM)', 'MT_PROGRAM', 'MT', 12, TRUE, 'Logistics & Operations'
FROM programme p WHERE p.title = 'MLBB Campus League Qualifier UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70456', 'Ahmad Zaki bin Ismail', 'Faculty of Computer Science and Mathematics (FSKM)', 'AJK_PROGRAM', 'AJK', 10, TRUE, NULL
FROM programme p WHERE p.title = 'MLBB Campus League Qualifier UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT p.id, n.sdg
FROM programme p
CROSS JOIN (
    SELECT 3 AS sdg UNION ALL SELECT 4 UNION ALL SELECT 11 UNION ALL SELECT 17
) n
WHERE p.title = 'MLBB Campus League Qualifier UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_sdg ps WHERE ps.programme_id = p.id AND ps.sdg_number = n.sdg);

INSERT INTO advisor_approval (programme_id, advisor_name, advisor_email, approval_method, status, remarks, approved_at)
SELECT p.id, 'Dr. Siti Aminah binti Yusof', 'siti.aminah@umt.edu.my', 'ONLINE', 'APPROVED',
    'Programme documentation complete. Recommended for HEPA final approval.', NOW() - INTERVAL 2 DAY
FROM programme p WHERE p.title = 'MLBB Campus League Qualifier UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM advisor_approval aa WHERE aa.programme_id = p.id);

INSERT INTO programme_document (programme_id, document_type, file_path, file_name)
SELECT p.id, 'APPLICATION_PDF', 'https://www.africau.edu/images/default/sample.pdf', 'MyStar Application Form - MLBB.pdf'
FROM programme p WHERE p.title = 'MLBB Campus League Qualifier UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_document pd WHERE pd.programme_id = p.id AND pd.document_type = 'APPLICATION_PDF');

INSERT INTO programme_document (programme_id, document_type, file_path, file_name)
SELECT p.id, 'ADVISOR_SIGNED', 'https://www.africau.edu/images/default/sample.pdf', 'Advisor Signed Form - MLBB.pdf'
FROM programme p WHERE p.title = 'MLBB Campus League Qualifier UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_document pd WHERE pd.programme_id = p.id AND pd.document_type = 'ADVISOR_SIGNED');

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70321', 'Lim Wei Ling', 'Faculty of Science and Marine Environment (FSSM)', 'PENGARAH_PROGRAM', 'DIRECTOR', 12, TRUE, NULL
FROM programme p WHERE p.title = 'Bengkel Fotografi Komuniti UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_committee pc WHERE pc.programme_id = p.id);

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70567', 'Siti Nurhaliza binti Omar', 'Faculty of Science and Marine Environment (FSSM)', 'MT_PROGRAM', 'MT', 10, TRUE, 'Documentation Lead'
FROM programme p WHERE p.title = 'Bengkel Fotografi Komuniti UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24';

INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT p.id, n.sdg
FROM programme p
CROSS JOIN (
    SELECT 4 AS sdg UNION ALL SELECT 11 UNION ALL SELECT 16
) n
WHERE p.title = 'Bengkel Fotografi Komuniti UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_sdg ps WHERE ps.programme_id = p.id AND ps.sdg_number = n.sdg);

INSERT INTO advisor_approval (programme_id, advisor_name, advisor_email, approval_method, status, remarks, approved_at)
SELECT p.id, 'Pn. Rosmah binti Abdullah', 'rosmah@umt.edu.my', 'SIGNED_PDF', 'APPROVED',
    'Advisor form verified. Suitable for publication after HEPA review.', NOW() - INTERVAL 3 DAY
FROM programme p WHERE p.title = 'Bengkel Fotografi Komuniti UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM advisor_approval aa WHERE aa.programme_id = p.id);

INSERT INTO programme_document (programme_id, document_type, file_path, file_name)
SELECT p.id, 'APPLICATION_PDF', 'https://www.africau.edu/images/default/sample.pdf', 'MyStar Application Form - Bengkel Fotografi.pdf'
FROM programme p WHERE p.title = 'Bengkel Fotografi Komuniti UMT' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_document pd WHERE pd.programme_id = p.id AND pd.document_type = 'APPLICATION_PDF');

INSERT INTO programme_committee (programme_id, matric_number, full_name, faculty, committee_role, merit_role_type, merit_points, has_campuslink_account, position_label)
SELECT p.id, 'S70999', 'Hakim bin Razak', 'Faculty of Computer Science and Mathematics (FSKM)', 'PENGARAH_PROGRAM', 'DIRECTOR', 15, TRUE, NULL
FROM programme p WHERE p.title = 'UMT Valorant Invitational 2026' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_committee pc WHERE pc.programme_id = p.id);

INSERT INTO programme_sdg (programme_id, sdg_number)
SELECT p.id, n.sdg
FROM programme p
CROSS JOIN (
    SELECT 3 AS sdg UNION ALL SELECT 4 UNION ALL SELECT 8
) n
WHERE p.title = 'UMT Valorant Invitational 2026' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM programme_sdg ps WHERE ps.programme_id = p.id AND ps.sdg_number = n.sdg);

INSERT INTO advisor_approval (programme_id, advisor_name, advisor_email, approval_method, status, remarks, approved_at)
SELECT p.id, 'Dr. Kamal bin Hussin', 'kamal@umt.edu.my', 'ONLINE', 'APPROVED',
    'E-sports programme approved by club advisor.', NOW() - INTERVAL 1 DAY
FROM programme p WHERE p.title = 'UMT Valorant Invitational 2026' AND p.sponsorship_info = 'CAMPUSLINK_WORKFLOW_V24'
AND NOT EXISTS (SELECT 1 FROM advisor_approval aa WHERE aa.programme_id = p.id);
