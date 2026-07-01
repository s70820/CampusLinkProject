package com.campuslink.campuslinkbackend.config;

import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.service.PasswordService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Ensures seeded demo accounts use known passwords for FYP presentations.
 * V18 reused a BCrypt hash that actually matches {@code sarah123} for role accounts.
 */
@Component
@Order(0)
public class DemoAccountPasswordBootstrap implements ApplicationRunner {

    private static final String DEMO_PASSWORD = "demo123";

    private static final Map<String, String> STUDENT_DEMO_PASSWORDS = new LinkedHashMap<>();

    static {
        STUDENT_DEMO_PASSWORDS.put("sarahdemo335@gmail.com", "sarah123");
        STUDENT_DEMO_PASSWORDS.put("sarah.demo@gmail.com", "sarah123");
        STUDENT_DEMO_PASSWORDS.put("amirul.demo@gmail.com", "amirul123");
        STUDENT_DEMO_PASSWORDS.put("syed.demo@gmail.com", "syed12345");
        STUDENT_DEMO_PASSWORDS.put("ahmad.demo@gmail.com", "ahmad123");
        STUDENT_DEMO_PASSWORDS.put("abu.demo@gmail.com", "abu123");
    }

    private static final List<String> DEMO_ROLE_EMAILS = List.of(
            "organizer1.demo@gmail.com",
            "organizer2.demo@gmail.com",
            "organizer3.demo@gmail.com",
            "organizer4.demo@gmail.com",
            "organizer5.demo@gmail.com",
            "organizer6.demo@gmail.com",
            "organizer7.demo@gmail.com",
            "organizer8.demo@gmail.com",
            "mpp1.demo@gmail.com",
            "mpp2.demo@gmail.com",
            "mpp3.demo@gmail.com",
            "mpp4.demo@gmail.com",
            "mpp5.demo@gmail.com",
            "hepa.demo@gmail.com",
            "hepa2.demo@gmail.com",
            "hepa3.demo@gmail.com"
    );

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    public DemoAccountPasswordBootstrap(UserRepository userRepository, PasswordService passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    @Override
    public void run(ApplicationArguments args) {
        String demoHash = passwordService.hashPassword(DEMO_PASSWORD);
        for (String email : DEMO_ROLE_EMAILS) {
            resetPasswordIfNeeded(email, DEMO_PASSWORD, demoHash);
        }
        for (Map.Entry<String, String> entry : STUDENT_DEMO_PASSWORDS.entrySet()) {
            resetPasswordIfNeeded(entry.getKey(), entry.getValue(), passwordService.hashPassword(entry.getValue()));
        }
        for (int i = 1; i <= 30; i++) {
            resetPasswordIfNeeded(String.format(Locale.ROOT, "s700%02d.demo@gmail.com", i), DEMO_PASSWORD, demoHash);
        }
        for (int i = 1; i <= 80; i++) {
            resetPasswordIfNeeded(String.format(Locale.ROOT, "s701%02d.demo@gmail.com", i), DEMO_PASSWORD, demoHash);
        }
        resetPasswordIfNeeded("safwan.demo@gmail.com", DEMO_PASSWORD, demoHash);
    }

    private void resetPasswordIfNeeded(String email, String plainPassword, String hash) {
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT));
        if (user == null) {
            return;
        }
        if (!passwordService.matches(plainPassword, user.getPasswordHash())) {
            user.setPasswordHash(hash);
            userRepository.save(user);
        }
    }
}
