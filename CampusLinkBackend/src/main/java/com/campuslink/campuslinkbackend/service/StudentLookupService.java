package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.dto.MatricRegistryResponse;
import com.campuslink.campuslinkbackend.dto.StudentLookupResponse;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.StudentRegistry;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.StudentRegistryRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

/**
 * Prototype student identity checks use {@code student_registry}.
 * Future production: replace with UMT SSO-backed identity verification.
 */
@Service
public class StudentLookupService {

    private static final String NOT_REGISTERED_MESSAGE =
            "Student not found. Please register in CampusLink+ first.";
    private static final String NOT_PARTICIPANT_MESSAGE =
            "This account cannot join as a programme participant.";
    private static final Set<String> PARTICIPANT_ROLES = Set.of("STUDENT", "MPP", "ORGANIZER");

    @Autowired
    private StudentRegistryRepository studentRegistryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private ProgrammeRegistrationEligibilityService eligibilityService;

    private static final String MATRIC_NOT_IN_REGISTRY_MESSAGE =
            "Matric number not found in UMT student registry.";

    public StudentLookupResponse lookupByMatric(String matricNumber) {
        User campusLinkUser = requireCampusLinkAccount(matricNumber);
        return toLookupResponse(campusLinkUser);
    }

    /**
     * Team registration: any approved CampusLink+ student, MPP, or organizer account
     * may participate unless blocked for this specific programme (organizer/committee).
     */
    public StudentLookupResponse lookupRegisteredParticipantForTeam(String matricNumber, Long programmeId) {
        User campusLinkUser = requireCampusLinkAccount(matricNumber);
        if (campusLinkUser.getMatricNumber() == null || campusLinkUser.getMatricNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, NOT_REGISTERED_MESSAGE);
        }
        if (campusLinkUser.getRole() == null
                || !PARTICIPANT_ROLES.contains(campusLinkUser.getRole().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, NOT_PARTICIPANT_MESSAGE);
        }
        if (campusLinkUser.getApprovalStatus() == null
                || !"APPROVED".equalsIgnoreCase(campusLinkUser.getApprovalStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "This account is not approved for CampusLink+ yet.");
        }
        if (programmeId != null) {
            Programme programme = programmeRepository.findById(programmeId).orElse(null);
            if (programme != null) {
                String restriction = eligibilityService.getMatricRestrictionReason(programme, matricNumber);
                if (restriction != null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, restriction);
                }
            }
        }
        return toLookupResponse(campusLinkUser);
    }

    private User requireCampusLinkAccount(String matricNumber) {
        String normalized = normalizeMatric(matricNumber);
        User campusLinkUser = userRepository.findByMatricNumber(normalized);
        if (campusLinkUser == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, NOT_REGISTERED_MESSAGE);
        }
        return campusLinkUser;
    }

    private StudentLookupResponse toLookupResponse(User campusLinkUser) {
        String normalized = normalizeMatric(campusLinkUser.getMatricNumber());
        StudentLookupResponse response = new StudentLookupResponse();
        response.setMatricNumber(campusLinkUser.getMatricNumber());
        response.setFullName(resolveUserDisplayName(campusLinkUser));
        response.setFaculty(resolveUserFaculty(campusLinkUser, normalized));
        response.setPhoneNumber(resolveUserPhone(campusLinkUser));
        response.setExistsInRegistry(studentRegistryRepository
                .findByMatricNumberIgnoreCase(normalized)
                .filter(registry -> Boolean.TRUE.equals(registry.getIsActive()))
                .isPresent());
        response.setHasCampusLinkAccount(true);
        response.setCampusLinkUserId(campusLinkUser.getId());
        return response;
    }

    public MatricRegistryResponse checkRegistry(String matricNumber) {
        String normalized = normalizeMatric(matricNumber);
        MatricRegistryResponse response = new MatricRegistryResponse();
        response.setMatricNumber(normalized);

        if (!normalized.matches("^S\\d{5}$")) {
            response.setFound(false);
            return response;
        }

        return studentRegistryRepository.findByMatricNumberIgnoreCase(normalized)
                .filter(registry -> Boolean.TRUE.equals(registry.getIsActive()))
                .map(registry -> {
                    response.setFound(true);
                    response.setFullName(registry.getFullName());
                    response.setFaculty(registry.getFaculty());
                    response.setStudyLevel(registry.getStudyLevel());
                    return response;
                })
                .orElseGet(() -> {
                    response.setFound(false);
                    return response;
                });
    }

    public void requireMatricInRegistry(String matricNumber) {
        MatricRegistryResponse registry = checkRegistry(matricNumber);
        if (!registry.isFound()) {
            throw new IllegalArgumentException(MATRIC_NOT_IN_REGISTRY_MESSAGE);
        }
    }

    public void syncUserToRegistry(User user) {
        if (user == null || user.getMatricNumber() == null || user.getMatricNumber().isBlank()) {
            return;
        }
        if (user.getRole() == null || !"STUDENT".equalsIgnoreCase(user.getRole())) {
            return;
        }

        String normalized = normalizeMatric(user.getMatricNumber());
        StudentRegistry registry = studentRegistryRepository
                .findByMatricNumberIgnoreCase(normalized)
                .orElse(new StudentRegistry());

        registry.setMatricNumber(normalized);
        registry.setFullName(user.getFullName());
        registry.setFaculty(user.getFaculty() != null && !user.getFaculty().isBlank()
                ? user.getFaculty()
                : (registry.getFaculty() != null ? registry.getFaculty() : "Not Specified"));
        if (registry.getStudyLevel() == null || registry.getStudyLevel().isBlank()) {
            registry.setStudyLevel("Degree");
        }
        registry.setIsActive(true);
        studentRegistryRepository.save(registry);
    }

    public String resolveStudyLevelForUser(User user) {
        if (user == null || user.getMatricNumber() == null || user.getMatricNumber().isBlank()) {
            return null;
        }
        MatricRegistryResponse registry = checkRegistry(user.getMatricNumber());
        return registry.isFound() ? registry.getStudyLevel() : null;
    }

    private String normalizeMatric(String matricNumber) {
        return matricNumber.trim().toUpperCase();
    }

    private String resolveUserDisplayName(User user) {
        String name = user.getFullName();
        if (name == null || name.isBlank()) {
            return user.getMatricNumber();
        }
        return name.replace(" (Demo)", "").trim();
    }

    private String resolveUserFaculty(User user, String normalizedMatric) {
        String faculty = user.getFaculty();
        if (faculty != null && !faculty.isBlank() && !"Not Specified".equalsIgnoreCase(faculty.trim())) {
            return faculty.trim();
        }
        return studentRegistryRepository.findByMatricNumberIgnoreCase(normalizedMatric)
                .map(StudentRegistry::getFaculty)
                .filter(f -> f != null && !f.isBlank() && !"Not Specified".equalsIgnoreCase(f.trim()))
                .orElse("Not Specified");
    }

    private String resolveUserPhone(User user) {
        String phone = user.getPhoneNumber();
        return phone != null && !phone.isBlank() ? phone.trim() : null;
    }
}
