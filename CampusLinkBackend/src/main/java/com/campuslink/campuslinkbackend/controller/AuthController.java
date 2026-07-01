package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.ForgotPasswordRequest;
import com.campuslink.campuslinkbackend.dto.ResetPasswordRequest;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.security.JwtUtil;
import com.campuslink.campuslinkbackend.exception.MailDeliveryException;
import com.campuslink.campuslinkbackend.service.PasswordResetService;
import com.campuslink.campuslinkbackend.service.PasswordService;
import com.campuslink.campuslinkbackend.service.ClubSecretaryService;
import com.campuslink.campuslinkbackend.service.RoleRequestService;
import com.campuslink.campuslinkbackend.service.StudentLookupService;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final PasswordResetService passwordResetService;
    private final StudentLookupService studentLookupService;
    private final ClubSecretaryService clubSecretaryService;
    private final RoleRequestService roleRequestService;
    private final JwtUtil jwtUtil;

    public AuthController(
            UserRepository userRepository,
            PasswordService passwordService,
            PasswordResetService passwordResetService,
            StudentLookupService studentLookupService,
            ClubSecretaryService clubSecretaryService,
            RoleRequestService roleRequestService,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.passwordResetService = passwordResetService;
        this.studentLookupService = studentLookupService;
        this.clubSecretaryService = clubSecretaryService;
        this.roleRequestService = roleRequestService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping({"/api/login", "/api/auth/login"})
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserCredentials credentials) {
        if (credentials.getEmail() == null || credentials.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email and password are required"));
        }

        String email = credentials.getEmail().trim();
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user != null && passwordService.matches(credentials.getPassword(), user.getPasswordHash())) {
            if ("REMOVED".equalsIgnoreCase(user.getApprovalStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "This account has been removed by HEPA. Please contact the HEPA office for assistance."));
            }

            String loginBlock = clubSecretaryService.loginBlockMessage(user);
            if (loginBlock != null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", loginBlock));
            }

            user = roleRequestService.syncUserRoleFromApprovals(user);

            String token = jwtUtil.generateToken(user);
            Map<String, Object> body = new HashMap<>();
            body.put("token", token);
            body.put("user", buildUserPayload(user));
            return ResponseEntity.ok(body);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid credentials!"));
    }

    @PostMapping({"/api/auth/forgot-password", "/auth/forgot-password"})
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        try {
            passwordResetService.requestPasswordReset(request.getEmail());
        } catch (MailDeliveryException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), ex);
        }
        return ResponseEntity.ok(Map.of(
                "message",
                "If an account exists for that email, a password reset link has been sent."
        ));
    }

    @PostMapping({"/api/auth/reset-password", "/auth/reset-password"})
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully. You can now sign in."));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    private Map<String, Object> buildUserPayload(User user) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", user.getId());
        payload.put("email", user.getEmail());
        payload.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        payload.put("role", user.getRole() != null ? user.getRole() : "STUDENT");
        if ("HEPA".equalsIgnoreCase(user.getRole())) {
            payload.put("matricNumber", "");
            payload.put("faculty", "");
        } else {
            payload.put("approvalStatus", user.getApprovalStatus() != null ? user.getApprovalStatus() : "APPROVED");
            payload.put("matricNumber", user.getMatricNumber() != null ? user.getMatricNumber() : "");
            payload.put("faculty", user.getFaculty() != null ? user.getFaculty() : "");
        }
        payload.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
        payload.put("clubName", user.getClubName() != null ? user.getClubName() : "");
        if ("STUDENT".equalsIgnoreCase(user.getRole())) {
            String studyLevel = studentLookupService.resolveStudyLevelForUser(user);
            if (studyLevel != null) {
                payload.put("studyLevel", studyLevel);
            }
        }
        return payload;
    }

    static class UserCredentials {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
