package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.RegistrationStatus;
import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.dto.HepaDashboardDto;
import com.campuslink.campuslinkbackend.dto.HepaReportsDto;
import com.campuslink.campuslinkbackend.dto.RoleRequestSummaryDto;
import com.campuslink.campuslinkbackend.dto.WorkflowProgrammeSummaryDto;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.RoleRequest;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ProgrammeRegistrationRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.RoleRequestRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HepaService {

    private static final List<String> ACTIVE_REGISTRATION_STATUSES = Arrays.asList(
            RegistrationStatus.ACTIVE,
            RegistrationStatus.PAYMENT_APPROVED
    );

    private final UserRepository userRepository;
    private final ProgrammeRepository programmeRepository;
    private final RoleRequestRepository roleRequestRepository;
    private final ProgrammeRegistrationRepository registrationRepository;

    public HepaService(
            UserRepository userRepository,
            ProgrammeRepository programmeRepository,
            RoleRequestRepository roleRequestRepository,
            ProgrammeRegistrationRepository registrationRepository) {
        this.userRepository = userRepository;
        this.programmeRepository = programmeRepository;
        this.roleRequestRepository = roleRequestRepository;
        this.registrationRepository = registrationRepository;
    }

    @Transactional(readOnly = true)
    public HepaDashboardDto getDashboard(Long hepaId) {
        User hepa = requireHepa(hepaId);
        List<Programme> programmes = programmeRepository.findAll();
        List<RoleRequest> roleRequests = roleRequestRepository.findAllByOrderByCreatedAtDesc();

        List<Programme> pendingProgrammes = programmes.stream()
                .filter(p -> WorkflowStatus.PENDING_HEPA.equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());

        List<RoleRequest> pendingRequests = roleRequests.stream()
                .filter(r -> RoleRequestService.STATUS_PENDING.equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        HepaDashboardDto dashboard = new HepaDashboardDto();
        dashboard.setFullName(hepa.getFullName());
        dashboard.setPendingProgrammeApproval(pendingProgrammes.size());
        dashboard.setApprovedProgrammes((int) programmes.stream()
                .filter(p -> WorkflowStatus.APPROVED.equalsIgnoreCase(p.getStatus()))
                .count());
        dashboard.setRejectedProgrammes((int) programmes.stream()
                .filter(p -> WorkflowStatus.REJECTED.equalsIgnoreCase(p.getStatus()))
                .count());
        dashboard.setPendingRoleRequests(pendingRequests.size());
        dashboard.setApprovedRoleRequests((int) roleRequests.stream()
                .filter(r -> RoleRequestService.STATUS_APPROVED.equalsIgnoreCase(r.getStatus()))
                .count());
        dashboard.setRejectedRoleRequests((int) roleRequests.stream()
                .filter(r -> RoleRequestService.STATUS_REJECTED.equalsIgnoreCase(r.getStatus()))
                .count());
        dashboard.setTotalStudents((int) userRepository.countByRoleIgnoreCase("STUDENT"));
        dashboard.setTotalOrganizers((int) userRepository.countByRoleIgnoreCase("ORGANIZER"));
        dashboard.setRecentPendingProgrammes(pendingProgrammes.stream()
                .limit(4)
                .map(this::toProgrammeSummary)
                .collect(Collectors.toList()));
        dashboard.setRecentRoleRequests(pendingRequests.stream()
                .limit(4)
                .map(this::toRoleRequestSummary)
                .collect(Collectors.toList()));
        return dashboard;
    }

    @Transactional(readOnly = true)
    public HepaReportsDto getReports(Long hepaId) {
        requireHepa(hepaId);
        List<Programme> programmes = programmeRepository.findAll();
        List<RoleRequest> roleRequests = roleRequestRepository.findAllByOrderByCreatedAtDesc();

        Map<String, Long> byCategory = programmes.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(Programme::getCategory, Collectors.counting()));

        HepaReportsDto reports = new HepaReportsDto();
        reports.setTotalProgrammes(programmes.size());
        reports.setApprovedProgrammes((int) programmes.stream()
                .filter(p -> WorkflowStatus.APPROVED.equalsIgnoreCase(p.getStatus()))
                .count());
        reports.setPendingHepaProgrammes((int) programmes.stream()
                .filter(p -> WorkflowStatus.PENDING_HEPA.equalsIgnoreCase(p.getStatus()))
                .count());
        reports.setPendingMppProgrammes((int) programmes.stream()
                .filter(p -> WorkflowStatus.PENDING_MPP_REVIEW.equalsIgnoreCase(p.getStatus())
                        || WorkflowStatus.PENDING_MPP.equalsIgnoreCase(p.getStatus()))
                .count());
        reports.setRejectedProgrammes((int) programmes.stream()
                .filter(p -> WorkflowStatus.REJECTED.equalsIgnoreCase(p.getStatus()))
                .count());
        reports.setTotalRoleRequests(roleRequests.size());
        reports.setPendingRoleRequests((int) roleRequests.stream()
                .filter(r -> RoleRequestService.STATUS_PENDING.equalsIgnoreCase(r.getStatus()))
                .count());
        reports.setTotalStudents((int) userRepository.countByRoleIgnoreCase("STUDENT"));
        reports.setTotalOrganizers((int) userRepository.countByRoleIgnoreCase("ORGANIZER"));
        reports.setTotalMpp((int) userRepository.countByRoleIgnoreCase("MPP"));
        reports.setProgrammesByCategory(byCategory.entrySet().stream()
                .map(e -> new HepaReportsDto.CategoryCountDto(e.getKey(), e.getValue().intValue()))
                .sorted(Comparator.comparing(HepaReportsDto.CategoryCountDto::getCount).reversed())
                .collect(Collectors.toList()));
        reports.setRecentApprovals(programmes.stream()
                .filter(p -> WorkflowStatus.APPROVED.equalsIgnoreCase(p.getStatus()))
                .sorted(Comparator.comparing(Programme::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(this::toProgrammeSummary)
                .collect(Collectors.toList()));
        return reports;
    }

    @Transactional(readOnly = true)
    public List<WorkflowProgrammeSummaryDto> getPendingProgrammes(Long hepaId) {
        requireHepa(hepaId);
        return programmeRepository.findByStatus(WorkflowStatus.PENDING_HEPA).stream()
                .map(this::toProgrammeSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkflowProgrammeSummaryDto> getReviewedProgrammes(Long hepaId) {
        requireHepa(hepaId);
        return programmeRepository.findAll().stream()
                .filter(p -> {
                    String status = p.getStatus();
                    if (status == null) return false;
                    return WorkflowStatus.APPROVED.equalsIgnoreCase(status)
                            || WorkflowStatus.COMPLETED.equalsIgnoreCase(status)
                            || WorkflowStatus.CANCELLED.equalsIgnoreCase(status)
                            || WorkflowStatus.REJECTED.equalsIgnoreCase(status);
                })
                .sorted(Comparator
                        .comparing(Programme::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toProgrammeSummary)
                .collect(Collectors.toList());
    }

    private WorkflowProgrammeSummaryDto toProgrammeSummary(Programme programme) {
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

    private RoleRequestSummaryDto toRoleRequestSummary(RoleRequest request) {
        RoleRequestSummaryDto dto = new RoleRequestSummaryDto();
        dto.setId(request.getId());
        dto.setRequestedRole(request.getRequestedRole());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        dto.setSubmittedAt(request.getCreatedAt());
        User requester = request.getUser();
        if (requester != null) {
            dto.setRequesterName(requester.getFullName());
            dto.setRequesterMatric(requester.getMatricNumber());
        }
        return dto;
    }

    private User requireHepa(Long hepaId) {
        User user = userRepository.findById(hepaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "HEPA user not found."));
        if (!"HEPA".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a HEPA administrator.");
        }
        return user;
    }
}
