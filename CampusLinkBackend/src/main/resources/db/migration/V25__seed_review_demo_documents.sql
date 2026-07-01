-- Demo supporting documents for role request review screens

UPDATE role_request rr
INNER JOIN user u ON u.id = rr.user_id
SET rr.documents_json = '[{"path":"https://www.africau.edu/images/default/sample.pdf","name":"UMT Club Organizer Approval Form.pdf"}]'
WHERE u.email = 'sarah.demo@gmail.com'
  AND rr.requested_role = 'ORGANIZER'
  AND rr.status = 'PENDING_HEPA_APPROVAL';

UPDATE role_request rr
INNER JOIN user u ON u.id = rr.user_id
SET rr.documents_json = '[{"path":"https://www.africau.edu/images/default/sample.pdf","name":"Faculty Endorsement Letter.pdf"},{"path":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","name":"MPP Appointment Certificate.pdf"}]'
WHERE u.email = 'amirul.demo@gmail.com'
  AND rr.requested_role = 'MPP'
  AND rr.status = 'PENDING_HEPA_APPROVAL';

UPDATE role_request rr
INNER JOIN user u ON u.id = rr.user_id
SET rr.documents_json = '[{"path":"https://www.africau.edu/images/default/sample.pdf","name":"organizer-form-ftkk.pdf"}]'
WHERE u.email = 'syed.demo@gmail.com'
  AND rr.requested_role = 'ORGANIZER'
  AND rr.status = 'APPROVED';

UPDATE role_request rr
INNER JOIN user u ON u.id = rr.user_id
SET rr.documents_json = '[{"path":"https://www.africau.edu/images/default/sample.pdf","name":"mpp-application.pdf"}]'
WHERE u.email = 'ahmad.demo@gmail.com'
  AND rr.requested_role = 'MPP'
  AND rr.status = 'REJECTED';
