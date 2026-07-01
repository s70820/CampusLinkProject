package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.CertificatePolicy;
import com.campuslink.campuslinkbackend.dto.CertificateBulkIssueResultDto;
import com.campuslink.campuslinkbackend.dto.CertificateRenderDto;
import com.campuslink.campuslinkbackend.entity.AdvisorApproval;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.ProgrammeAttendance;
import com.campuslink.campuslinkbackend.entity.ProgrammeRegistration;
import com.campuslink.campuslinkbackend.entity.StudentCertificate;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.AdvisorApprovalRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeAttendanceRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRegistrationRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.StudentCertificateRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.util.ClubAdvisorDefaults;
import com.campuslink.campuslinkbackend.util.FileUrlHelper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class OrganizerCertificateService {

    private static final String PRESENT = "PRESENT";

    private final ProgrammeRepository programmeRepository;
    private final ProgrammeRegistrationRepository registrationRepository;
    private final ProgrammeAttendanceRepository attendanceRepository;
    private final StudentCertificateRepository certificateRepository;
    private final AdvisorApprovalRepository advisorApprovalRepository;
    private final UserRepository userRepository;

    public OrganizerCertificateService(
            ProgrammeRepository programmeRepository,
            ProgrammeRegistrationRepository registrationRepository,
            ProgrammeAttendanceRepository attendanceRepository,
            StudentCertificateRepository certificateRepository,
            AdvisorApprovalRepository advisorApprovalRepository,
            UserRepository userRepository) {
        this.programmeRepository = programmeRepository;
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.certificateRepository = certificateRepository;
        this.advisorApprovalRepository = advisorApprovalRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CertificateRenderDto issueCertificate(Long organizerId, Long programmeId, Long registrationId) {
        Programme programme = requireOrganizerProgramme(organizerId, programmeId);
        assertSystemCertificateMode(programme);
        assertWithinIssuanceWindow(programme);

        ProgrammeRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));
        if (!programmeId.equals(registration.getProgramme().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration does not belong to this programme.");
        }

        User student = registration.getUser();
        assertStudentAttended(programmeId, student.getId());
        StudentCertificate certificate = ensureCertificate(programme, student);

        return buildRenderDto(programme, student, certificate);
    }

    @Transactional
    public CertificateBulkIssueResultDto issueAllCertificates(Long organizerId, Long programmeId) {
        Programme programme = requireOrganizerProgramme(organizerId, programmeId);
        assertSystemCertificateMode(programme);
        assertWithinIssuanceWindow(programme);

        Set<Long> userIds = collectPresentUserIds(programmeId);
        int issued = 0;
        int skipped = 0;
        for (Long userId : userIds) {
            User student = userRepository.findById(userId).orElse(null);
            if (student == null) {
                continue;
            }
            if (certificateRepository.existsByUserIdAndProgrammeId(userId, programmeId)) {
                skipped++;
            } else {
                createCertificate(programme, student);
                issued++;
            }
        }

        CertificateBulkIssueResultDto result = new CertificateBulkIssueResultDto();
        result.setIssuedCount(issued);
        result.setSkippedCount(skipped);
        result.setTotalEligible(userIds.size());
        return result;
    }

    public CertificateRenderDto getStudentCertificateRender(Long userId, Long certificateId) {
        StudentCertificate certificate = certificateRepository.findByIdAndUserId(certificateId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate not found."));
        if (!"READY".equalsIgnoreCase(certificate.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certificate is not ready for download.");
        }
        return buildRenderDto(certificate.getProgramme(), certificate.getUser(), certificate);
    }

    public CertificateRenderDto previewCertificate(Long organizerId, Long programmeId, Long registrationId) {
        Programme programme = requireOrganizerProgramme(organizerId, programmeId);
        assertSystemCertificateMode(programme);
        assertWithinIssuanceWindow(programme);

        ProgrammeRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));
        if (!programmeId.equals(registration.getProgramme().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration does not belong to this programme.");
        }
        assertStudentAttended(programmeId, registration.getUser().getId());
        return buildRenderDto(programme, registration.getUser(), null);
    }

    private Set<Long> collectPresentUserIds(Long programmeId) {
        List<ProgrammeAttendance> presentRecords = attendanceRepository
                .findByProgramme_IdAndAttendanceStatus(programmeId, PRESENT);
        Set<Long> userIds = new LinkedHashSet<>();
        for (ProgrammeAttendance record : presentRecords) {
            userIds.add(record.getUser().getId());
        }
        return userIds;
    }

    private StudentCertificate ensureCertificate(Programme programme, User student) {
        return certificateRepository.findByUserIdAndProgrammeId(student.getId(), programme.getId())
                .orElseGet(() -> createCertificate(programme, student));
    }

    private StudentCertificate createCertificate(Programme programme, User student) {
        StudentCertificate certificate = new StudentCertificate();
        certificate.setUser(student);
        certificate.setProgramme(programme);
        certificate.setProgrammeTitle(programme.getTitle());
        certificate.setOrganizerClub(programme.getOrganizerClub());
        certificate.setCertificateType("PARTICIPATION");
        certificate.setIssuedAt(resolveEventDate(programme));
        certificate.setStatus("READY");
        return certificateRepository.save(certificate);
    }

    private void assertStudentAttended(Long programmeId, Long userId) {
        if (!attendanceRepository.existsByProgramme_IdAndUser_IdAndAttendanceStatus(programmeId, userId, PRESENT)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only students marked present can receive certificates.");
        }
    }

    private void assertWithinIssuanceWindow(Programme programme) {
        LocalDate eventEnd = resolveEventDate(programme);
        LocalDate today = LocalDate.now();
        if (today.isBefore(eventEnd)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Certificates can only be issued after the programme has ended.");
        }
        LocalDate deadline = eventEnd.plusDays(CertificatePolicy.ISSUANCE_WINDOW_DAYS);
        if (today.isAfter(deadline)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The certificate issuance window has closed (3 weeks after programme end).");
        }
    }

    private CertificateRenderDto buildRenderDto(Programme programme, User student, StudentCertificate certificate) {
        AdvisorApproval advisor = advisorApprovalRepository.findByProgrammeId(programme.getId()).orElse(null);
        ClubAdvisorDefaults.Advisor fallbackAdvisor = ClubAdvisorDefaults.forOrganizerClub(programme.getOrganizerClub());
        String advisorName = resolveAdvisorName(advisor, fallbackAdvisor);
        String signaturePath = programme.getAdvisorSignaturePath();
        if (signaturePath == null || signaturePath.isBlank()) {
            signaturePath = ClubAdvisorDefaults.signaturePath(fallbackAdvisor);
        }

        CertificateRenderDto dto = new CertificateRenderDto();
        dto.setCertificateId(certificate != null ? certificate.getId() : null);
        dto.setStudentName(student.getFullName());
        dto.setMatricNumber(student.getMatricNumber());
        dto.setProgrammeTitle(programme.getTitle());
        dto.setOrganizerClub(programme.getOrganizerClub());
        dto.setVenue(programme.getVenue());
        dto.setEventDate(resolveEventDate(programme));
        dto.setIssueDate(certificate != null && certificate.getIssuedAt() != null
                ? certificate.getIssuedAt()
                : LocalDate.now());
        dto.setAdvisorName(advisorName);
        dto.setAdvisorSignatureUrl(FileUrlHelper.toPublicUrl(signaturePath));
        dto.setCertificateTemplate(
                programme.getCertificateTemplate() != null ? programme.getCertificateTemplate() : "GEOMETRIC_MODERN");
        dto.setCertificateOrientation(
                programme.getCertificateOrientation() != null ? programme.getCertificateOrientation() : "PORTRAIT");
        return dto;
    }

    private static String resolveAdvisorName(AdvisorApproval advisor, ClubAdvisorDefaults.Advisor fallbackAdvisor) {
        if (advisor != null && advisor.getAdvisorName() != null && !advisor.getAdvisorName().isBlank()) {
            String name = advisor.getAdvisorName().trim();
            if (!"Penasihat Kelab".equalsIgnoreCase(name) && !"Demo Advisor".equalsIgnoreCase(name)) {
                return name;
            }
        }
        return fallbackAdvisor.name();
    }

    private Programme requireOrganizerProgramme(Long organizerId, Long programmeId) {
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme not found."));
        if (programme.getOrganizer() == null || !organizerId.equals(programme.getOrganizer().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own programmes.");
        }
        return programme;
    }

    private void assertSystemCertificateMode(Programme programme) {
        String mode = programme.getCertificateMode() != null ? programme.getCertificateMode().toUpperCase() : "SYSTEM";
        if ("MANUAL".equals(mode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This programme uses manual certificates outside CampusLink+.");
        }
    }

    private LocalDate resolveEventDate(Programme programme) {
        if (programme.getEndDate() != null) {
            return programme.getEndDate();
        }
        return programme.getStartDate() != null ? programme.getStartDate() : LocalDate.now();
    }
}
