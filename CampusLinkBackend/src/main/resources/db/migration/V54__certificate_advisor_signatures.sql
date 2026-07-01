-- Realistic club advisor names and signature paths for completed / certificate-issuing programmes.

INSERT INTO advisor_approval (programme_id, advisor_name, advisor_email, approval_method, status, remarks, approved_at)
SELECT
    p.id,
    CASE
        WHEN LOWER(p.organizer_club) LIKE '%robot%' THEN 'Dr. Ahmad Faizal bin Ismail'
        WHEN LOWER(p.organizer_club) LIKE '%debat%' THEN 'Prof. Dr. Kamal bin Hussin'
        WHEN LOWER(p.organizer_club) LIKE '%prs%' OR LOWER(p.organizer_club) LIKE '%pembimbing%' THEN 'Pn. Norazila binti Mohd Rashid'
        WHEN LOWER(p.organizer_club) LIKE '%keusahawanan%' THEN 'Dr. Sharifah binti Mohd Zain'
        ELSE 'Dr. Siti Aminah binti Yusof'
    END,
    CASE
        WHEN LOWER(p.organizer_club) LIKE '%robot%' THEN 'ahmad.faizal@umt.edu.my'
        WHEN LOWER(p.organizer_club) LIKE '%debat%' THEN 'kamal.hussin@umt.edu.my'
        WHEN LOWER(p.organizer_club) LIKE '%prs%' OR LOWER(p.organizer_club) LIKE '%pembimbing%' THEN 'norazila@umt.edu.my'
        WHEN LOWER(p.organizer_club) LIKE '%keusahawanan%' THEN 'sharifah.zain@umt.edu.my'
        ELSE 'siti.aminah@umt.edu.my'
    END,
    'SIGNED_PDF',
    'APPROVED',
    'Club advisor verification complete for certificate issuance.',
    COALESCE(p.completed_at, NOW()) - INTERVAL 5 DAY
FROM programme p
WHERE p.status = 'COMPLETED'
  AND NOT EXISTS (SELECT 1 FROM advisor_approval aa WHERE aa.programme_id = p.id);

UPDATE advisor_approval aa
INNER JOIN programme p ON p.id = aa.programme_id
SET
    aa.advisor_name = CASE
        WHEN LOWER(p.organizer_club) LIKE '%robot%' THEN 'Dr. Ahmad Faizal bin Ismail'
        WHEN LOWER(p.organizer_club) LIKE '%debat%' THEN 'Prof. Dr. Kamal bin Hussin'
        WHEN LOWER(p.organizer_club) LIKE '%prs%' OR LOWER(p.organizer_club) LIKE '%pembimbing%' THEN 'Pn. Norazila binti Mohd Rashid'
        WHEN LOWER(p.organizer_club) LIKE '%keusahawanan%' THEN 'Dr. Sharifah binti Mohd Zain'
        ELSE 'Dr. Siti Aminah binti Yusof'
    END,
    aa.advisor_email = CASE
        WHEN LOWER(p.organizer_club) LIKE '%robot%' THEN 'ahmad.faizal@umt.edu.my'
        WHEN LOWER(p.organizer_club) LIKE '%debat%' THEN 'kamal.hussin@umt.edu.my'
        WHEN LOWER(p.organizer_club) LIKE '%prs%' OR LOWER(p.organizer_club) LIKE '%pembimbing%' THEN 'norazila@umt.edu.my'
        WHEN LOWER(p.organizer_club) LIKE '%keusahawanan%' THEN 'sharifah.zain@umt.edu.my'
        ELSE 'siti.aminah@umt.edu.my'
    END
WHERE p.status = 'COMPLETED';

UPDATE programme p
SET advisor_signature_path = CASE
    WHEN LOWER(p.organizer_club) LIKE '%robot%' THEN 'uploads/demo-docs/advisor-signatures/ahmad-faizal.png'
    WHEN LOWER(p.organizer_club) LIKE '%debat%' THEN 'uploads/demo-docs/advisor-signatures/kamal-hussin.png'
    WHEN LOWER(p.organizer_club) LIKE '%prs%' OR LOWER(p.organizer_club) LIKE '%pembimbing%' THEN 'uploads/demo-docs/advisor-signatures/norazila.png'
    WHEN LOWER(p.organizer_club) LIKE '%keusahawanan%' THEN 'uploads/demo-docs/advisor-signatures/sharifah-zain.png'
    ELSE 'uploads/demo-docs/advisor-signatures/siti-aminah.png'
END
WHERE p.status = 'COMPLETED';
