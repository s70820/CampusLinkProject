-- Programme registration workflow: paid, team, payment verification

ALTER TABLE programme
    ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN registration_fee DECIMAL(10,2) NULL,
    ADD COLUMN payment_instructions TEXT NULL,
    ADD COLUMN payment_reference_format VARCHAR(255) NULL,
    ADD COLUMN payment_qr_path VARCHAR(500) NULL,
    ADD COLUMN is_team_programme BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN team_name_required BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN min_team_size INT NULL,
    ADD COLUMN max_team_size INT NULL;

CREATE TABLE IF NOT EXISTS programme_registration (
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
    UNIQUE KEY uk_reg_programme_user (programme_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_registration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT NOT NULL,
    leader_user_id BIGINT NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'BUILDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_team_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_leader FOREIGN KEY (leader_user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_registration_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    matric_number VARCHAR(50) NOT NULL,
    phone_number VARCHAR(30) NULL,
    invitation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    programme_registration_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    CONSTRAINT fk_member_team FOREIGN KEY (team_registration_id) REFERENCES team_registration(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
    CONSTRAINT fk_member_registration FOREIGN KEY (programme_registration_id) REFERENCES programme_registration(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_receipt (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    programme_registration_id BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NULL,
    payment_reference VARCHAR(255) NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipt_registration FOREIGN KEY (programme_registration_id) REFERENCES programme_registration(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_verification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_receipt_id BIGINT NOT NULL UNIQUE,
    organizer_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remarks TEXT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verify_receipt FOREIGN KEY (payment_receipt_id) REFERENCES payment_receipt(id) ON DELETE CASCADE,
    CONSTRAINT fk_verify_organizer FOREIGN KEY (organizer_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(40) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(30) NOT NULL,
    reference_id BIGINT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

ALTER TABLE programme_registration
    ADD CONSTRAINT fk_reg_team FOREIGN KEY (team_registration_id) REFERENCES team_registration(id) ON DELETE SET NULL;
