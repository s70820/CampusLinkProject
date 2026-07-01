package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.DraftPolicy;
import com.campuslink.campuslinkbackend.constants.RegistrationStatus;
import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.dto.OrganizerAttendanceDto;
import com.campuslink.campuslinkbackend.dto.OrganizerDashboardDto;
import com.campuslink.campuslinkbackend.dto.OrganizerProgrammeSummaryDto;
import com.campuslink.campuslinkbackend.entity.AdvisorApproval;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.ProgrammeAttendance;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.AdvisorApprovalRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeAttendanceRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRegistrationRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.util.FileUrlHelper;
import com.campuslink.campuslinkbackend.util.OrganizerProgrammePolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrganizerService {

    private static final List<String> OCCUPYING_STATUSES = Arrays.asList(
            RegistrationStatus.ACTIVE,
            RegistrationStatus.PENDING_PAYMENT_VERIFICATION,
            RegistrationStatus.PENDING_TEAM,
            RegistrationStatus.PAYMENT_APPROVED
    );

    private final UserRepository userRepository;
    private final ProgrammeRepository programmeRepository;
    private final ProgrammeRegistrationRepository registrationRepository;
    private final ProgrammeAttendanceRepository attendanceRepository;
    private final AdvisorApprovalRepository advisorApprovalRepository;

    public OrganizerService(
            UserRepository userRepository,
            ProgrammeRepository programmeRepository,
            ProgrammeRegistrationRepository registrationRepository,
            ProgrammeAttendanceRepository attendanceRepository,
            AdvisorApprovalRepository advisorApprovalRepository) {
        this.userRepository = userRepository;
        this.programmeRepository = programmeRepository;
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.advisorApprovalRepository = advisorApprovalRepository;
    }

    public OrganizerDashboardDto getDashboard(Long organizerId) {
        User organizer = requireOrganizer(organizerId);
        List<Programme> programmes = programmeRepository.findByOrganizer_IdOrderByStartDateDesc(organizerId);
        List<OrganizerProgrammeSummaryDto> summaries = programmes.stream()
                .map(this::toSummary)
                .collect(Collectors.toList());

        long totalParticipants = summaries.stream().mapToLong(OrganizerProgrammeSummaryDto::getParticipantCount).sum();

        OrganizerDashboardDto dashboard = new OrganizerDashboardDto();
        dashboard.setFullName(organizer.getFullName());
        dashboard.setClubName(organizer.getClubName());
        dashboard.setFaculty(organizer.getFaculty());
        dashboard.setTotalProgrammes(programmes.size());
        dashboard.setPendingApproval((int) programmes.stream().filter(this::isPendingApproval).count());
        dashboard.setApprovedProgrammes((int) programmes.stream().filter(this::isApproved).count());
        dashboard.setDraftProgrammes((int) programmes.stream()
                .filter(this::isEditableDraft)
                .count());
        dashboard.setTotalParticipants(totalParticipants);
        dashboard.setActiveRegistrations(summaries.stream()
                .mapToLong(p -> registrationRepository.countByProgrammeIdAndStatusIn(
                        p.getId(), List.of(RegistrationStatus.ACTIVE)))
                .sum());
        dashboard.setAverageParticipantsPerProgramme(
                programmes.isEmpty() ? 0 : (double) totalParticipants / programmes.size());
        dashboard.setRecentProgrammes(summaries.stream().limit(6).collect(Collectors.toList()));
        return dashboard;
    }

    public List<OrganizerProgrammeSummaryDto> getProgrammes(Long organizerId, boolean operationalOnly) {
        requireOrganizer(organizerId);
        return programmeRepository.findByOrganizer_IdOrderByStartDateDesc(organizerId).stream()
                .filter(programme -> !operationalOnly || OrganizerProgrammePolicy.isOperational(programme))
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public List<OrganizerProgrammeSummaryDto> getProgrammes(Long organizerId) {
        return getProgrammes(organizerId, false);
    }

    public List<OrganizerAttendanceDto> getProgrammeAttendance(Long organizerId, Long programmeId) {
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme not found."));
        if (programme.getOrganizer() == null || !organizerId.equals(programme.getOrganizer().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view attendance for your own programmes.");
        }
        if (!OrganizerProgrammePolicy.isOperational(programme)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Attendance is only available for approved programmes.");
        }

        return attendanceRepository.findByProgramme_IdOrderByCheckedInAtDesc(programmeId).stream()
                .map(this::toAttendanceDto)
                .collect(Collectors.toList());
    }

    private OrganizerAttendanceDto toAttendanceDto(ProgrammeAttendance attendance) {
        User student = attendance.getUser();
        OrganizerAttendanceDto dto = new OrganizerAttendanceDto();
        dto.setUserId(student.getId());
        dto.setStudentFullName(student.getFullName());
        dto.setMatricNumber(student.getMatricNumber());
        dto.setFaculty(student.getFaculty());
        dto.setSessionLabel(attendance.getSessionLabel());
        dto.setAttendanceStatus(attendance.getAttendanceStatus());
        dto.setCheckedInAt(attendance.getCheckedInAt());
        return dto;
    }

    private OrganizerProgrammeSummaryDto toSummary(Programme programme) {
        OrganizerProgrammeSummaryDto dto = new OrganizerProgrammeSummaryDto();
        dto.setId(programme.getId());
        dto.setTitle(programme.getTitle());
        dto.setCategory(programme.getCategory());
        dto.setStatus(programme.getStatus());
        dto.setMppStatus(programme.getMppStatus());
        dto.setHepaStatus(programme.getHepaStatus());
        dto.setStartDate(programme.getStartDate());
        dto.setEndDate(programme.getEndDate());
        dto.setExpectedParticipants(programme.getExpectedParticipants());
        dto.setOrganizerClub(programme.getOrganizerClub());
        dto.setMeritPoints(programme.getMeritPoints());
        dto.setVenue(programme.getVenue());
        dto.setCertificateMode(
                programme.getCertificateMode() != null ? programme.getCertificateMode() : "SYSTEM");
        dto.setCertificateTemplate(
                programme.getCertificateTemplate() != null ? programme.getCertificateTemplate() : "GEOMETRIC_MODERN");
        dto.setCertificateOrientation(
                programme.getCertificateOrientation() != null ? programme.getCertificateOrientation() : "PORTRAIT");
        advisorApprovalRepository.findByProgrammeId(programme.getId())
                .map(AdvisorApproval::getAdvisorName)
                .ifPresent(dto::setAdvisorName);
        dto.setAdvisorSignatureUrl(FileUrlHelper.toPublicUrl(programme.getAdvisorSignaturePath()));
        dto.setParticipantCount(registrationRepository.countByProgrammeIdAndStatusIn(
                programme.getId(), OCCUPYING_STATUSES));
        dto.setUpdatedAt(programme.getUpdatedAt());
        if (isEditableDraft(programme) && programme.getUpdatedAt() != null) {
            LocalDateTime expiresAt = programme.getUpdatedAt().plusDays(DraftPolicy.RETENTION_DAYS);
            long daysRemaining = Math.max(0, ChronoUnit.DAYS.between(LocalDateTime.now(), expiresAt));
            dto.setDraftExpiresAt(expiresAt);
            dto.setDraftDaysRemaining((int) daysRemaining);
            dto.setDraftExpiringSoon(daysRemaining <= DraftPolicy.WARNING_DAYS_BEFORE_EXPIRY);
        }
        return dto;
    }

    private boolean isEditableDraft(Programme programme) {
        String status = programme.getStatus() != null ? programme.getStatus().toUpperCase() : "";
        return WorkflowStatus.DRAFT.equalsIgnoreCase(status)
                || WorkflowStatus.PENDING_ADVISOR_APPROVAL.equalsIgnoreCase(status)
                || WorkflowStatus.ADVISOR_APPROVED.equalsIgnoreCase(status);
    }

    private boolean isPendingApproval(Programme programme) {
        String status = programme.getStatus() != null ? programme.getStatus().toUpperCase() : "";
        return WorkflowStatus.PENDING_MPP.equalsIgnoreCase(status)
                || WorkflowStatus.PENDING_MPP_REVIEW.equalsIgnoreCase(status)
                || WorkflowStatus.PENDING_HEPA.equalsIgnoreCase(status)
                || "PENDING".equalsIgnoreCase(programme.getMppStatus())
                || "PENDING".equalsIgnoreCase(programme.getHepaStatus());
    }

    private boolean isApproved(Programme programme) {
        return WorkflowStatus.APPROVED.equalsIgnoreCase(programme.getStatus())
                || "APPROVED".equalsIgnoreCase(programme.getMppStatus())
                        && "APPROVED".equalsIgnoreCase(programme.getHepaStatus());
    }

    private User requireOrganizer(Long organizerId) {
        User user = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizer not found."));
        if (!"ORGANIZER".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not an organizer.");
        }
        return user;
    }
}
