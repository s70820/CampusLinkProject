package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.dto.UserOverviewDto;
import com.campuslink.campuslinkbackend.dto.UserSummaryDto;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    public static final String ACCOUNT_REMOVED = "REMOVED";

    private final UserRepository userRepository;
    private final ProgrammeRepository programmeRepository;
    private final ClubSecretaryService clubSecretaryService;

    public AdminUserService(
            UserRepository userRepository,
            ProgrammeRepository programmeRepository,
            ClubSecretaryService clubSecretaryService) {
        this.userRepository = userRepository;
        this.programmeRepository = programmeRepository;
        this.clubSecretaryService = clubSecretaryService;
    }

    public UserOverviewDto getOverview(Long requesterId) {
        requireAdmin(requesterId);

        UserOverviewDto overview = new UserOverviewDto();
        overview.setStudents(userRepository.countByRoleIgnoreCase("STUDENT"));
        overview.setOrganizers(userRepository.countByRoleIgnoreCase("ORGANIZER"));
        overview.setMpp(userRepository.countByRoleIgnoreCase("MPP"));
        overview.setHepa(userRepository.countByRoleIgnoreCase("HEPA"));
        overview.setTotalUsers(
                overview.getStudents()
                        + overview.getOrganizers()
                        + overview.getMpp()
                        + overview.getHepa());

        List<UserSummaryDto> recentUsers = userRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .limit(12)
                .map(this::toSummary)
                .collect(Collectors.toList());
        overview.setRecentUsers(recentUsers);
        return overview;
    }

    public List<UserSummaryDto> listUsers(Long requesterId, String roleFilter) {
        requireAdmin(requesterId);

        List<User> users;
        if (roleFilter == null || roleFilter.isBlank() || "ALL".equalsIgnoreCase(roleFilter)) {
            users = userRepository.findAll(Sort.by(Sort.Direction.ASC, "fullName"));
        } else {
            users = userRepository.findByRoleIgnoreCaseOrderByFullNameAsc(roleFilter.trim());
        }

        return users.stream().map(this::toSummary).collect(Collectors.toList());
    }

    @Transactional
    public void removeUser(Long hepaId, Long targetUserId, String reason) {
        User hepa = userRepository.findById(hepaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        requireHepa(hepa);

        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Removal reason is required.");
        }

        if (hepaId.equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot remove your own account.");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (ACCOUNT_REMOVED.equalsIgnoreCase(target.getApprovalStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This account has already been removed.");
        }

        String role = target.getRole() != null ? target.getRole().toUpperCase(Locale.ROOT) : "STUDENT";
        if ("HEPA".equals(role) || "MPP".equals(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "MPP and HEPA administrator accounts cannot be removed from this page.");
        }

        if ("ORGANIZER".equals(role)) {
            long approvedProgrammes = programmeRepository.countByOrganizer_IdAndStatus(targetUserId, "APPROVED");
            if (approvedProgrammes > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Cancel or complete this organizer's published programmes before removing the account.");
            }
            clubSecretaryService.releaseSecretary(target);
        }

        target.setApprovalStatus(ACCOUNT_REMOVED);
        target.setRole("STUDENT");
        target.setClubId(null);
        target.setClubName(null);
        userRepository.save(target);
    }

    private UserSummaryDto toSummary(User user) {
        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        String role = user.getRole() != null ? user.getRole().toUpperCase(Locale.ROOT) : "STUDENT";
        dto.setRole(role);
        if ("HEPA".equals(role)) {
            dto.setMatricNumber(null);
            dto.setFaculty(null);
            dto.setApprovalStatus(null);
        } else {
            dto.setMatricNumber(user.getMatricNumber());
            dto.setFaculty(user.getFaculty());
            dto.setApprovalStatus(user.getApprovalStatus());
            if ("ORGANIZER".equals(role)) {
                dto.setClubName(user.getClubName());
            }
        }
        return dto;
    }

    private void requireAdmin(Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        String role = requester.getRole() != null ? requester.getRole().toUpperCase(Locale.ROOT) : "";
        if (!"MPP".equals(role) && !"HEPA".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only MPP and HEPA administrators can access user management.");
        }
    }

    private void requireHepa(User user) {
        String role = user.getRole() != null ? user.getRole().toUpperCase(Locale.ROOT) : "";
        if (!"HEPA".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only HEPA administrators can remove user accounts.");
        }
    }
}
