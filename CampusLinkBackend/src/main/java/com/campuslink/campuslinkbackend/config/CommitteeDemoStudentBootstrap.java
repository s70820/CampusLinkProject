package com.campuslink.campuslinkbackend.config;

import com.campuslink.campuslinkbackend.entity.StudentRegistry;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.StudentRegistryRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.service.PasswordService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Ensures robotics-workshop committee matrics resolve in the organizer form even if
 * a Flyway migration was not applied yet (e.g. backend restart blocked by port 8080).
 */
@Component
@Profile("!kerocket")
@Order(1)
public class CommitteeDemoStudentBootstrap implements ApplicationRunner {

    private static final String DEMO_PASSWORD = "demo123";
    private static final String DEMO_HASH =
            "$2a$10$osjGumwKpYABAmDBfLZVl.lohnB0jeHx24xXTZzysCErX0jZs5aqW";
    private static final String FSKM = "Faculty of Computer Science and Mathematics (FSKM)";

    private static final List<String> COMMITTEE_MATRICS = List.of(
            "S70002", "S70003", "S70004", "S70005", "S70462"
    );

    private final UserRepository userRepository;
    private final StudentRegistryRepository studentRegistryRepository;
    private final PasswordService passwordService;

    public CommitteeDemoStudentBootstrap(
            UserRepository userRepository,
            StudentRegistryRepository studentRegistryRepository,
            PasswordService passwordService) {
        this.userRepository = userRepository;
        this.studentRegistryRepository = studentRegistryRepository;
        this.passwordService = passwordService;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureRegistryRow("S70002", "Muhammad Hafiz bin Razak", FSKM, "Master");
        ensureRegistryRow("S70003", "Tan Wei Lin", FSKM, "Degree");
        ensureRegistryRow("S70004", "Arvind a/l Subramaniam", FSKM, "PhD");
        ensureRegistryRow("S70005", "Siti Nabilah binti Hassan", FSKM, "Diploma");
        ensureRegistryRow("S70462", "Sarah Amara", FSKM, "Degree");
        ensureRegistryRow("S70980", "Safwan Haikal", FSKM, "Degree");

        relocateSafwanIfMisassigned();
        COMMITTEE_MATRICS.forEach(this::ensureCampusLinkStudent);
    }

    private void relocateSafwanIfMisassigned() {
        User wrongHolder = userRepository.findByMatricNumber("S70002");
        if (wrongHolder == null) {
            return;
        }
        String name = wrongHolder.getFullName() != null ? wrongHolder.getFullName() : "";
        if (name.contains("Muhammad Hafiz")) {
            return;
        }
        wrongHolder.setMatricNumber("S70980");
        wrongHolder.setFullName("Safwan Haikal");
        wrongHolder.setFaculty(FSKM);
        if (wrongHolder.getEmail() == null || wrongHolder.getEmail().isBlank()) {
            wrongHolder.setEmail("safwan.demo@gmail.com");
        }
        userRepository.save(wrongHolder);
    }

    private void ensureRegistryRow(String matric, String fullName, String faculty, String studyLevel) {
        StudentRegistry registry = studentRegistryRepository
                .findByMatricNumberIgnoreCase(matric)
                .orElseGet(StudentRegistry::new);
        registry.setMatricNumber(matric);
        registry.setFullName(fullName);
        registry.setFaculty(faculty);
        registry.setStudyLevel(studyLevel);
        registry.setIsActive(true);
        studentRegistryRepository.save(registry);
    }

    private void ensureCampusLinkStudent(String matric) {
        Optional<StudentRegistry> registryOpt = studentRegistryRepository.findByMatricNumberIgnoreCase(matric);
        if (registryOpt.isEmpty()) {
            return;
        }
        StudentRegistry registry = registryOpt.get();
        String demoEmail = matric.toLowerCase(Locale.ROOT) + ".demo@gmail.com";

        User user = userRepository.findByMatricNumber(matric);
        if (user == null) {
            user = userRepository.findByEmailIgnoreCase(demoEmail);
        }
        if (user == null) {
            user = new User();
            user.setMatricNumber(matric);
            user.setEmail(demoEmail);
            user.setRole("STUDENT");
            user.setApprovalStatus("APPROVED");
            user.setPasswordHash(DEMO_HASH);
            user.setPhoneNumber("01" + matric.substring(1));
            user.setIcNumber(matric.substring(1) + "010150" + matric.charAt(6));
        }

        user.setMatricNumber(matric);
        user.setFullName(registry.getFullName());
        user.setFaculty(registry.getFaculty());
        user.setRole("STUDENT");
        user.setApprovalStatus("APPROVED");
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            user.setEmail(demoEmail);
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            user.setPasswordHash(DEMO_HASH);
        } else if (!passwordService.matches(DEMO_PASSWORD, user.getPasswordHash())) {
            user.setPasswordHash(DEMO_HASH);
        }
        userRepository.save(user);
    }
}
