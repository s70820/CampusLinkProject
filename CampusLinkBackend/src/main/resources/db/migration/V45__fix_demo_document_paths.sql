-- Replace external sample PDF URLs with local CampusLink demo documents (see DemoDocumentBootstrap)

UPDATE role_request
SET documents_json = '[{"path":"uploads/demo-docs/umt-club-organizer-approval-form.pdf","name":"UMT Club Organizer Approval Form.pdf"}]'
WHERE documents_json LIKE '%africau.edu%'
  AND documents_json LIKE '%Club Organizer%';

UPDATE role_request
SET documents_json = '[{"path":"uploads/demo-docs/faculty-endorsement-letter.pdf","name":"Faculty Endorsement Letter.pdf"},{"path":"uploads/demo-docs/mpp-appointment-certificate.pdf","name":"MPP Appointment Certificate.pdf"}]'
WHERE documents_json LIKE '%africau.edu%'
  AND documents_json LIKE '%Faculty Endorsement%';

UPDATE role_request
SET documents_json = '[{"path":"uploads/demo-docs/umt-club-organizer-approval-form.pdf","name":"organizer-form-ftkk.pdf"}]'
WHERE documents_json LIKE '%africau.edu%'
  AND documents_json LIKE '%organizer-form-ftkk%';

UPDATE role_request
SET documents_json = '[{"path":"uploads/demo-docs/faculty-endorsement-letter.pdf","name":"mpp-application.pdf"}]'
WHERE documents_json LIKE '%africau.edu%'
  AND documents_json LIKE '%mpp-application%';

UPDATE role_request
SET documents_json = REPLACE(
        REPLACE(documents_json,
                'https://www.africau.edu/images/default/sample.pdf',
                'uploads/demo-docs/umt-club-organizer-approval-form.pdf'),
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        'uploads/demo-docs/mpp-appointment-certificate.pdf')
WHERE documents_json LIKE '%http%';

UPDATE programme_document
SET file_path = 'uploads/demo-docs/mystar-application-form.pdf'
WHERE file_path LIKE '%africau.edu%'
  AND document_type = 'APPLICATION_PDF';

UPDATE programme_document
SET file_path = 'uploads/demo-docs/advisor-signed-form.pdf'
WHERE file_path LIKE '%africau.edu%'
  AND document_type = 'ADVISOR_SIGNED';

UPDATE programme_document
SET file_path = REPLACE(
        REPLACE(file_path,
                'https://www.africau.edu/images/default/sample.pdf',
                'uploads/demo-docs/mystar-application-form.pdf'),
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        'uploads/demo-docs/advisor-signed-form.pdf')
WHERE file_path LIKE '%http%';
