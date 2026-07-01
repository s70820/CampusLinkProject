-- Point Amirul's pending MPP demo docs to the Amirul-specific endorsement letter.

UPDATE role_request rr
INNER JOIN user u ON u.id = rr.user_id
SET rr.documents_json = '[{"path":"uploads/demo-docs/faculty-endorsement-letter-amirul.pdf","name":"Faculty Endorsement Letter.pdf"},{"path":"uploads/demo-docs/mpp-appointment-certificate.pdf","name":"MPP Appointment Certificate.pdf"}]'
WHERE u.email = 'amirul.demo@gmail.com'
  AND rr.requested_role = 'MPP'
  AND rr.documents_json LIKE '%faculty-endorsement-letter.pdf%'
  AND rr.documents_json NOT LIKE '%faculty-endorsement-letter-amirul.pdf%';
