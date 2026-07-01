-- Support multiple supporting documents per role request (e.g. up to 3 for MPP)

ALTER TABLE role_request
    ADD COLUMN documents_json TEXT NULL AFTER document_name;
