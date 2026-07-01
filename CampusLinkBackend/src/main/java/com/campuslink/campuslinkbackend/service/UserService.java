package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

/**
 * Registration validates matric numbers against {@code student_registry} as a prototype
 * stand-in for UMT identity verification. Future production deployments should integrate
 * UMT SSO for automatic identity verification instead of manual registry checks.
 */
@Service
public class UserService {

    private static final Pattern PERSONAL_EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentLookupService studentLookupService;

    @Autowired
    private PasswordService passwordService;

    public User registerUser(User user) {
        validateRegistration(user);

        if (userRepository.findByEmailIgnoreCase(user.getEmail()) != null) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        if (userRepository.findByMatricNumber(user.getMatricNumber()) != null) {
            throw new IllegalArgumentException("Matric number is already registered.");
        }

        if (userRepository.findByIcNumber(user.getIcNumber()) != null) {
            throw new IllegalArgumentException("IC number is already registered.");
        }

        String rawPassword = user.getPassword() != null ? user.getPassword() : user.getPasswordHash();
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }
        if (rawPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }
        user.setPasswordHash(passwordService.hashPassword(rawPassword));

        user.setRole(user.getRole() != null ? user.getRole() : "STUDENT");
        User saved = userRepository.save(user);
        if ("STUDENT".equalsIgnoreCase(saved.getRole())) {
            studentLookupService.syncUserToRegistry(saved);
        }
        return saved;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    private void validateRegistration(User user) {
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (user.getMatricNumber() == null || user.getMatricNumber().isBlank()) {
            throw new IllegalArgumentException("Matric number is required.");
        }
        if (!user.getMatricNumber().trim().matches("(?i)^S\\d{5}$")) {
            throw new IllegalArgumentException("Matric number must be in format SXXXXX.");
        }
        user.setMatricNumber(user.getMatricNumber().trim().toUpperCase());

        studentLookupService.requireMatricInRegistry(user.getMatricNumber());

        if (user.getFaculty() == null || user.getFaculty().isBlank()) {
            throw new IllegalArgumentException("Faculty is required.");
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Personal email is required.");
        }
        String normalizedEmail = user.getEmail().trim().toLowerCase();
        if (!PERSONAL_EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            throw new IllegalArgumentException("Please enter a valid personal email address.");
        }
        if (normalizedEmail.endsWith("@ocean.umt.edu.my")) {
            throw new IllegalArgumentException("Please use your personal email (Gmail, Outlook, Yahoo, etc.), not your UMT student email.");
        }
        user.setEmail(normalizedEmail);

        if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            throw new IllegalArgumentException("Phone number is required.");
        }
        String normalizedPhone = normalizePhoneNumber(user.getPhoneNumber());
        if (!normalizedPhone.matches("^\\+?\\d{8,15}$")) {
            throw new IllegalArgumentException(
                    "Phone number must be a valid Malaysian or international number (8-15 digits, optional + prefix)."
            );
        }
        user.setPhoneNumber(normalizedPhone);

        if (user.getIcNumber() == null || user.getIcNumber().isBlank()) {
            throw new IllegalArgumentException("IC number is required.");
        }
        String normalizedIc = user.getIcNumber().replaceAll("\\D", "");
        if (!normalizedIc.matches("^\\d{12}$")) {
            throw new IllegalArgumentException("IC number must be exactly 12 digits.");
        }
        user.setIcNumber(normalizedIc);
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber.replaceAll("[\\s\\-().]", "");
    }
}
