-- Pre-MPP organizer work stays as draft (no separate advisor-pending status).
UPDATE programme
SET status = 'DRAFT'
WHERE status IN ('PENDING_ADVISOR_APPROVAL', 'ADVISOR_APPROVED');
