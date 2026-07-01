package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.dto.MppDashboardDto;
import com.campuslink.campuslinkbackend.dto.WorkflowProgrammeSummaryDto;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MppService {

    private static final List<String> MPP_PENDING_STATUSES = Arrays.asList(
            WorkflowStatus.PENDING_MPP_REVIEW,
            WorkflowStatus.PENDING_MPP
    );

    private final UserRepository userRepository;
    private final ProgrammeRepository programmeRepository;

    public MppService(UserRepository userRepository, ProgrammeRepository programmeRepository) {
        this.userRepository = userRepository;
        this.programmeRepository = programmeRepository;
    }

    @Transactional(readOnly = true)
    public MppDashboardDto getDashboard(Long mppId) {
        User mpp = requireMpp(mppId);
        List<Programme> allProgrammes = programmeRepository.findAll();

        List<Programme> pending = allProgrammes.stream()
                .filter(p -> isPendingMpp(p.getStatus()))
                .sorted(Comparator.comparing(Programme::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        MppDashboardDto dashboard = new MppDashboardDto();
        dashboard.setFullName(mpp.getFullName());
        dashboard.setFaculty(mpp.getFaculty());
        dashboard.setPendingReview(pending.size());
        dashboard.setMppApproved((int) allProgrammes.stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getMppStatus()))
                .count());
        dashboard.setMppRejected((int) allProgrammes.stream()
                .filter(p -> "REJECTED".equalsIgnoreCase(p.getMppStatus()))
                .count());
        dashboard.setForwardedToHepa((int) allProgrammes.stream()
                .filter(p -> WorkflowStatus.PENDING_HEPA.equalsIgnoreCase(p.getStatus()))
                .count());
        dashboard.setTotalProgrammes(allProgrammes.size());
        dashboard.setRecentPending(pending.stream()
                .limit(6)
                .map(this::toSummary)
                .collect(Collectors.toList()));
        return dashboard;
    }

    @Transactional(readOnly = true)
    public List<WorkflowProgrammeSummaryDto> getPendingProgrammes(Long mppId) {
        requireMpp(mppId);
        return programmeRepository.findAll().stream()
                .filter(p -> isPendingMpp(p.getStatus()))
                .sorted(Comparator.comparing(Programme::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkflowProgrammeSummaryDto> getReviewedProgrammes(Long mppId) {
        requireMpp(mppId);
        return programmeRepository.findAll().stream()
                .filter(p -> !isPendingMpp(p.getStatus()))
                .filter(p -> {
                    String mppStatus = p.getMppStatus();
                    return mppStatus != null && !mppStatus.equalsIgnoreCase("PENDING");
                })
                .sorted(Comparator
                        .comparing(Programme::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    private boolean isPendingMpp(String status) {
        if (status == null) return false;
        return MPP_PENDING_STATUSES.stream().anyMatch(s -> s.equalsIgnoreCase(status));
    }

    private WorkflowProgrammeSummaryDto toSummary(Programme programme) {
        WorkflowProgrammeSummaryDto dto = new WorkflowProgrammeSummaryDto();
        dto.setId(programme.getId());
        dto.setTitle(programme.getTitle());
        dto.setCategory(programme.getCategory());
        dto.setStatus(programme.getStatus());
        dto.setMppStatus(programme.getMppStatus());
        dto.setHepaStatus(programme.getHepaStatus());
        dto.setMppRemarks(programme.getMppRemarks());
        dto.setStartDate(programme.getStartDate());
        dto.setEndDate(programme.getEndDate());
        dto.setVenue(programme.getVenue());
        dto.setOrganizerClub(programme.getOrganizerClub());
        dto.setExpectedParticipants(programme.getExpectedParticipants());
        dto.setMeritPoints(programme.getMeritPoints());
        if (programme.getOrganizer() != null) {
            dto.setOrganizerName(programme.getOrganizer().getFullName());
        }
        return dto;
    }

    private User requireMpp(Long mppId) {
        User user = userRepository.findById(mppId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "MPP user not found."));
        if (!"MPP".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not an MPP reviewer.");
        }
        return user;
    }
}
