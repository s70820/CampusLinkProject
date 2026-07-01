CREATE TABLE IF NOT EXISTS password_reset_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_password_reset_token UNIQUE (token),
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_user_id ON password_reset_token (user_id);
CREATE INDEX idx_password_reset_expires_at ON password_reset_token (expires_at);
