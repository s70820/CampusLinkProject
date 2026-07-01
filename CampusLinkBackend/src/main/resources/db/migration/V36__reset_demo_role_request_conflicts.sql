-- Reset Amirul demo student if upgraded via document-less seeded MPP request (organizer workflow testing)
UPDATE user
SET role = 'STUDENT',
    approval_status = 'APPROVED',
    club_id = NULL,
    club_name = NULL
WHERE email = 'amirul.demo@gmail.com'
  AND role <> 'STUDENT';

-- Retire seeded role requests that never went through the student upload workflow
UPDATE role_request rr
INNER JOIN user u ON u.id = rr.user_id
SET rr.status = 'REJECTED',
    rr.review_notes = 'Superseded: submit a fresh request with uploaded documents via the student portal.',
    rr.reviewed_at = COALESCE(rr.reviewed_at, NOW())
WHERE u.email = 'amirul.demo@gmail.com'
  AND rr.status IN ('PENDING_HEPA_APPROVAL', 'APPROVED')
  AND rr.document_path IS NULL
  AND (rr.documents_json IS NULL OR TRIM(rr.documents_json) = '');
