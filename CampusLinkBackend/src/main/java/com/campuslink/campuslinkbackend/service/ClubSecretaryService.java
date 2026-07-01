package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.dto.ClubSummaryDto;
import com.campuslink.campuslinkbackend.entity.Club;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ClubRepository;
import com.campuslink.campuslinkbackend.repository.RoleRequestRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ClubSecretaryService {

    private static final Pattern SEEDED_DEMO_SECRETARY_EMAIL = Pattern.compile(
            "^organizer\\d+\\.demo@gmail\\.com$",
            Pattern.CASE_INSENSITIVE);

    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final RoleRequestRepository roleRequestRepository;

    public ClubSecretaryService(
            ClubRepository clubRepository,
            UserRepository userRepository,
            RoleRequestRepository roleRequestRepository) {
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.roleRequestRepository = roleRequestRepository;
    }

    public List<ClubSummaryDto> listActiveClubs() {
        return clubRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public static String normalizeClubName(String raw) {
        if (raw == null) {
            return null;
        }
        String normalized = raw.trim().replaceAll("\\s+", " ");
        return normalized.isEmpty() ? null : normalized;
    }

    public void assertUserEligibleForSecretary(User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is required.");
        }
        if ("ORGANIZER".equalsIgnoreCase(user.getRole())
                && "APPROVED".equalsIgnoreCase(user.getApprovalStatus() != null ? user.getApprovalStatus() : "")
                && user.getClubName() != null
                && !user.getClubName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You are already registered as a club secretary. Each student may only serve as secretary for one club.");
        }
    }

    public void assertClubNameAvailableForSecretary(String clubName) {
        assertClubNameAvailableForSecretary(clubName, null);
    }

    public void assertClubNameAvailableForSecretary(String clubName, Long excludeRequestId) {
        String normalized = normalizeClubName(clubName);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Club name is required.");
        }
        if (normalized.length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Please enter the full official club name (at least 3 characters).");
        }

        User occupyingSecretary = userRepository
                .findByRoleIgnoreCaseAndApprovalStatusIgnoreCaseAndClubNameIgnoreCase(
                        "ORGANIZER", "APPROVED", normalized);
        if (occupyingSecretary != null) {
            if (excludeRequestId != null && isSeededDemoSecretary(occupyingSecretary)) {
                releaseSecretary(occupyingSecretary);
            } else {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This club already has an approved secretary. Only one secretary may publish programmes for each club.");
            }
        }

        if (hasPendingSecretaryRequest(normalized, excludeRequestId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Another secretary application for this club is already pending HEPA review.");
        }
    }

    /**
     * Removes an approved club secretary and frees the club for a new appointment.
     */
    public void releaseSecretary(User user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is required.");
        }
        if (!"ORGANIZER".equalsIgnoreCase(user.getRole())) {
            return;
        }

        if (user.getClubId() != null) {
            clubRepository.findById(user.getClubId()).ifPresent(club -> {
                if (user.getId().equals(club.getSecretaryUserId())) {
                    club.setSecretaryUserId(null);
                    clubRepository.save(club);
                }
            });
        } else {
            String normalized = normalizeClubName(user.getClubName());
            if (normalized != null) {
                clubRepository.findByNameIgnoreCase(normalized).ifPresent(club -> {
                    if (user.getId().equals(club.getSecretaryUserId())) {
                        club.setSecretaryUserId(null);
                        clubRepository.save(club);
                    }
                });
            }
        }

        user.setRole("STUDENT");
        user.setApprovalStatus("APPROVED");
        user.setClubId(null);
        user.setClubName(null);
        userRepository.save(user);
    }

    public void assignSecretary(User user, String clubName, Long approvedRequestId) {
        String normalized = normalizeClubName(clubName);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Club name is required.");
        }

        if ("ORGANIZER".equalsIgnoreCase(user.getRole())
                && normalized.equalsIgnoreCase(normalizeClubName(user.getClubName()))) {
            return;
        }

        assertClubNameAvailableForSecretary(normalized, approvedRequestId);

        Club club = clubRepository.findByNameIgnoreCase(normalized).orElseGet(() -> {
            Club created = new Club();
            created.setName(normalized);
            return clubRepository.save(created);
        });

        if (club.getSecretaryUserId() != null && !club.getSecretaryUserId().equals(user.getId())) {
            User incumbent = userRepository.findById(club.getSecretaryUserId()).orElse(null);
            if (approvedRequestId != null && incumbent != null && isSeededDemoSecretary(incumbent)) {
                releaseSecretary(incumbent);
                club = clubRepository.findById(club.getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                                "This club already has an approved secretary. Only one secretary may publish programmes for each club."));
            } else {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This club already has an approved secretary. Only one secretary may publish programmes for each club.");
            }
        }

        user.setRole("ORGANIZER");
        user.setApprovalStatus("APPROVED");
        user.setClubId(club.getId());
        user.setClubName(normalized);
        userRepository.save(user);

        club.setSecretaryUserId(user.getId());
        clubRepository.save(club);
    }

    private boolean isSeededDemoSecretary(User user) {
        if (user == null || user.getEmail() == null) {
            return false;
        }
        return SEEDED_DEMO_SECRETARY_EMAIL.matcher(user.getEmail().trim()).matches();
    }

    private boolean hasPendingSecretaryRequest(String clubName, Long excludeRequestId) {
        if (excludeRequestId != null) {
            return roleRequestRepository.existsByRequestedRoleIgnoreCaseAndStatusAndClubNameIgnoreCaseAndIdNot(
                    "ORGANIZER",
                    RoleRequestService.STATUS_PENDING,
                    clubName,
                    excludeRequestId);
        }
        return roleRequestRepository.existsByRequestedRoleIgnoreCaseAndStatusAndClubNameIgnoreCase(
                "ORGANIZER",
                RoleRequestService.STATUS_PENDING,
                clubName);
    }

    private ClubSummaryDto toSummary(Club club) {
        ClubSummaryDto dto = new ClubSummaryDto();
        dto.setId(club.getId());
        dto.setName(club.getName());
        boolean hasSecretary = club.getSecretaryUserId() != null;
        dto.setHasSecretary(hasSecretary);
        if (hasSecretary) {
            userRepository.findById(club.getSecretaryUserId())
                    .map(User::getFullName)
                    .ifPresent(dto::setSecretaryName);
        }
        return dto;
    }

    public String loginBlockMessage(User user) {
        if (user == null || user.getRole() == null) {
            return null;
        }
        String role = user.getRole().toUpperCase(Locale.ROOT);
        String approval = user.getApprovalStatus() != null
                ? user.getApprovalStatus().toUpperCase(Locale.ROOT)
                : "";

        if ("ORGANIZER".equals(role) && !"APPROVED".equals(approval)) {
            return "Your club secretary account is pending HEPA approval. Please sign in as a student or wait for approval.";
        }
        if ("MPP".equals(role) && !"APPROVED".equals(approval)) {
            return "Your MPP account is pending HEPA approval. Please sign in as a student or wait for approval.";
        }
        if ("ORGANIZER".equals(role) && normalizeClubName(user.getClubName()) == null) {
            return "Your organizer account is not linked to a club. Please contact HEPA for assistance.";
        }
        return null;
    }
}
