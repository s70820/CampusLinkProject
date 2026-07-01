-- Replace legacy programme_registration (student_id / enum status) with workflow schema

ALTER TABLE team_member DROP FOREIGN KEY fk_member_registration;
ALTER TABLE payment_receipt DROP FOREIGN KEY fk_receipt_registration;

DROP TABLE programme_registration;

CREATE TABLE programme_registration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    registration_type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
    team_registration_id BIGINT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    payment_reference VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reg_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_team FOREIGN KEY (team_registration_id) REFERENCES team_registration(id) ON DELETE SET NULL,
    UNIQUE KEY uk_reg_programme_user (programme_id, user_id)
);

ALTER TABLE team_member
    ADD CONSTRAINT fk_member_registration FOREIGN KEY (programme_registration_id) REFERENCES programme_registration(id) ON DELETE SET NULL;

ALTER TABLE payment_receipt
    ADD CONSTRAINT fk_receipt_registration FOREIGN KEY (programme_registration_id) REFERENCES programme_registration(id) ON DELETE CASCADE;
