package com.campuslink.campuslinkbackend.config;

import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.service.PasswordService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Ensures seeded demo accounts use known passwords for FYP presentations.
 * On Kerocket, uses a fast repair-only path (no BCrypt) to avoid Cloudflare 524 timeouts on cold start.
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
    private final Environment environment;

    public DemoAccountPasswordBootstrap(
            UserRepository userRepository,
            PasswordService passwordService,
            Environment environment) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (isKerocketProfile()) {
            runKerocketLightRepair();
            return;
        }
        runFullPasswordSync();
    }

    /** Fast path: repair roles only — passwords already correct after SQL import. */
    private void runKerocketLightRepair() {
        for (String email : DEMO_ROLE_EMAILS) {
            repairDemoRoleAccount(email);
        }
        for (String email : STUDENT_DEMO_PASSWORDS.keySet()) {
            repairDemoStudentAccount(email);
        }
        repairDemoStudentAccount("safwan.demo@gmail.com");
    }

    private void runFullPasswordSync() {
        String demoHash = passwordService.hashPassword(DEMO_PASSWORD);
        Map<String, String> studentHashes = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : STUDENT_DEMO_PASSWORDS.entrySet()) {
            studentHashes.put(entry.getKey(), passwordService.hashPassword(entry.getValue()));
        }

        for (String email : DEMO_ROLE_EMAILS) {
            syncDemoAccount(email, DEMO_PASSWORD, demoHash, false);
        }
        for (Map.Entry<String, String> entry : STUDENT_DEMO_PASSWORDS.entrySet()) {
            syncDemoAccount(entry.getKey(), entry.getValue(), studentHashes.get(entry.getKey()), true);
        }
        for (int i = 1; i <= 30; i++) {
            syncDemoAccount(String.format(Locale.ROOT, "s700%02d.demo@gmail.com", i), DEMO_PASSWORD, demoHash, true);
        }
        for (int i = 1; i <= 80; i++) {
            syncDemoAccount(String.format(Locale.ROOT, "s701%02d.demo@gmail.com", i), DEMO_PASSWORD, demoHash, true);
        }
        syncDemoAccount("safwan.demo@gmail.com", DEMO_PASSWORD, demoHash, true);
    }

    private void syncDemoAccount(String email, String plainPassword, String hash, boolean repairStudentFields) {
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT));
        if (user == null) {
            return;
        }
        if (!passwordService.matches(plainPassword, user.getPasswordHash())) {
            user.setPasswordHash(hash);
            userRepository.save(user);
        }
        if (repairStudentFields) {
            repairDemoStudentAccount(user);
        } else {
            repairDemoRoleAccount(email);
        }
    }

    private boolean isKerocketProfile() {
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(profile -> "kerocket".equalsIgnoreCase(profile));
    }

    private void repairDemoStudentAccount(String email) {
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT));
        if (user != null) {
            repairDemoStudentAccount(user);
        }
    }

    private void repairDemoStudentAccount(User user) {
        boolean changed = false;
        if (!"STUDENT".equalsIgnoreCase(user.getRole())) {
            user.setRole("STUDENT");
            changed = true;
        }
        if (!"APPROVED".equalsIgnoreCase(user.getApprovalStatus())) {
            user.setApprovalStatus("APPROVED");
            changed = true;
        }
        if (user.getClubId() != null) {
            user.setClubId(null);
            changed = true;
        }
        if (user.getClubName() != null && !user.getClubName().isBlank()) {
            user.setClubName(null);
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
        }
    }

    private void repairDemoRoleAccount(String email) {
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT));
        if (user == null || user.getRole() == null) {
            return;
        }
        String role = user.getRole().toUpperCase(Locale.ROOT);
        if (!"ORGANIZER".equals(role) && !"MPP".equals(role) && !"HEPA".equals(role)) {
            return;
        }
        if (!"APPROVED".equalsIgnoreCase(user.getApprovalStatus())) {
            user.setApprovalStatus("APPROVED");
            userRepository.save(user);
        }
    }
}
