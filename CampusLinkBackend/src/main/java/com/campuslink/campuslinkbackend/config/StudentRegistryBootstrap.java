package com.campuslink.campuslinkbackend.config;

import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.service.StudentLookupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Keeps student_registry aligned with registered CampusLink+ users.
 * Prototype only — production should use UMT SSO instead of manual registry sync.
 */
@Component
public class StudentRegistryBootstrap implements ApplicationRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentLookupService studentLookupService;

    @Override
    public void run(ApplicationArguments args) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if ("STUDENT".equalsIgnoreCase(user.getRole())
                    && user.getMatricNumber() != null
                    && !user.getMatricNumber().isBlank()) {
                studentLookupService.syncUserToRegistry(user);
            }
        }
    }
}
