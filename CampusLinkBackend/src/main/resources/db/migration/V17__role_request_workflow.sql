-- Role request workflow: student applications for Organizer / MPP roles

CREATE TABLE IF NOT EXISTS role_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    requested_role VARCHAR(20) NOT NULL,
    reason TEXT,
    document_path VARCHAR(500),
    document_name VARCHAR(255),
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING_HEPA_APPROVAL',
    review_notes TEXT,
    reviewed_by BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_role_request_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_request_reviewer FOREIGN KEY (reviewed_by) REFERENCES user(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS role_request_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_request_id BIGINT NOT NULL,
    from_status VARCHAR(40),
    to_status VARCHAR(40) NOT NULL,
    action VARCHAR(80) NOT NULL,
    performed_by BIGINT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role_history_request FOREIGN KEY (role_request_id) REFERENCES role_request(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_history_user FOREIGN KEY (performed_by) REFERENCES user(id) ON DELETE SET NULL
);

CREATE INDEX idx_role_request_user ON role_request(user_id);
CREATE INDEX idx_role_request_status ON role_request(status);
