-- Organizer-defined extra registration fields and student responses

ALTER TABLE programme
    ADD COLUMN custom_registration_fields_json TEXT NULL AFTER communication_link;

ALTER TABLE programme_registration
    ADD COLUMN custom_responses_json TEXT NULL AFTER payment_reference;
