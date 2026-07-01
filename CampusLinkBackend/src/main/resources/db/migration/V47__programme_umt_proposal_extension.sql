-- UMT programme proposal workflow: budget, tentative schedule, speakers, participant breakdown

ALTER TABLE programme
    ADD COLUMN expected_student_participants INT NULL,
    ADD COLUMN expected_staff_participants INT NULL,
    ADD COLUMN expected_external_participants INT NULL;

CREATE TABLE programme_budget_line (
    id BIGINT NOT NULL AUTO_INCREMENT,
    programme_id BIGINT NOT NULL,
    line_type VARCHAR(10) NOT NULL,
    category VARCHAR(40) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_budget_programme FOREIGN KEY (programme_id) REFERENCES programme (id) ON DELETE CASCADE,
    INDEX idx_budget_programme (programme_id)
);

CREATE TABLE programme_tentative (
    id BIGINT NOT NULL AUTO_INCREMENT,
    programme_id BIGINT NOT NULL,
    time_slot VARCHAR(80) NOT NULL,
    activity TEXT NOT NULL,
    person_in_charge VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_tentative_programme FOREIGN KEY (programme_id) REFERENCES programme (id) ON DELETE CASCADE,
    INDEX idx_tentative_programme (programme_id)
);

CREATE TABLE programme_speaker (
    id BIGINT NOT NULL AUTO_INCREMENT,
    programme_id BIGINT NOT NULL,
    speaker_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NULL,
    organization VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    cv_path VARCHAR(500) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_speaker_programme FOREIGN KEY (programme_id) REFERENCES programme (id) ON DELETE CASCADE,
    INDEX idx_speaker_programme (programme_id)
);
