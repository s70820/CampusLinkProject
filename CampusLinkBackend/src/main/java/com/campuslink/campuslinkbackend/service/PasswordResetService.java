package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.entity.PasswordResetToken;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.PasswordResetTokenRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.password-reset.expiry-minutes:60}")
    private long expiryMinutes;

    @Transactional
    public void requestPasswordReset(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim());
        if (user == null) {
            return;
        }

        passwordResetTokenRepository.deleteByUser(user);

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        passwordResetTokenRepository.save(token);

        String resetLink = frontendUrl + "/reset-password?token=" + token.getToken();
        String name = user.getFullName() != null ? user.getFullName() : "there";
        emailService.sendPasswordResetEmail(user.getEmail(), name, resetLink);
    }

    @Transactional
    public void resetPassword(String tokenValue, String newPassword) {
        if (tokenValue == null || tokenValue.isBlank()) {
            throw new IllegalArgumentException("Reset token is required.");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        PasswordResetToken token = passwordResetTokenRepository.findByToken(tokenValue.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));

        if (token.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used.");
        }
        if (token.isExpired()) {
            throw new IllegalArgumentException("Invalid or expired reset token.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordService.hashPassword(newPassword));
        userRepository.save(user);

        token.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);
    }
}
