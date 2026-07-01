package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.dto.*;
import com.campuslink.campuslinkbackend.entity.ProgrammeAttendance;
import com.campuslink.campuslinkbackend.entity.StudentCertificate;
import com.campuslink.campuslinkbackend.entity.StudentMeritRecord;
import com.campuslink.campuslinkbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentPortalService {

    private final ProgrammeRegistrationRepository registrationRepository;
    private final ProgrammeAttendanceRepository attendanceRepository;
    private final StudentMeritRecordRepository meritRecordRepository;
    private final StudentCertificateRepository certificateRepository;

    public StudentPortalService(
            ProgrammeRegistrationRepository registrationRepository,
            ProgrammeAttendanceRepository attendanceRepository,
            StudentMeritRecordRepository meritRecordRepository,
            StudentCertificateRepository certificateRepository
    ) {
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.meritRecordRepository = meritRecordRepository;
        this.certificateRepository = certificateRepository;
    }

    public StudentDashboardStatsDto getDashboardStats(Long userId) {
        requireUserId(userId);
        var registrations = registrationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int programsJoined = registrations.size();
        int active = (int) registrations.stream().filter(r -> "ACTIVE".equals(r.getStatus())).count();
        int pending = (int) registrations.stream().filter(r ->
                List.of("PENDING_PAYMENT_VERIFICATION", "PENDING_TEAM", "PENDING_PAYMENT").contains(r.getStatus())
        ).count();

        List<StudentMeritRecord> meritRecords = meritRecordRepository.findByUserIdOrderByAwardedAtDesc(userId);
        int meritPoints = meritRecords.stream()
                .filter(m -> "COMPLETED".equals(m.getStatus()))
                .mapToInt(StudentMeritRecord::getMeritPoints)
                .sum();

        long sessionsAttended = attendanceRepository.countByUserIdAndAttendanceStatus(userId, "PRESENT");
        long certificatesReady = certificateRepository.countByUserIdAndStatus(userId, "READY");

        int registeredProgrammes = (int) registrations.stream()
                .filter(r -> "ACTIVE".equals(r.getStatus()))
                .count();
        String attendanceRate = registeredProgrammes > 0
                ? Math.min(100, Math.round((sessionsAttended * 100.0) / Math.max(registeredProgrammes, 1))) + "%"
                : "0%";

        StudentDashboardStatsDto dto = new StudentDashboardStatsDto();
        dto.setMeritPoints(meritPoints);
        dto.setProgramsJoined(programsJoined);
        dto.setCompletedPrograms(active);
        dto.setPendingApprovals(pending);
        dto.setSessionsAttended((int) sessionsAttended);
        dto.setCertificatesReady((int) certificatesReady);
        dto.setAttendanceRate(attendanceRate);
        return dto;
    }

    public List<StudentAttendanceDto> getAttendanceHistory(Long userId) {
        requireUserId(userId);
        return attendanceRepository.findByUserIdOrderByCheckedInAtDesc(userId).stream()
                .map(this::toAttendanceDto)
                .collect(Collectors.toList());
    }

    public List<StudentMeritRecordDto> getMeritRecords(Long userId) {
        requireUserId(userId);
        return meritRecordRepository.findByUserIdWithProgrammeOrderByAwardedAtDesc(userId).stream()
                .map(this::toMeritDto)
                .collect(Collectors.toList());
    }

    public List<StudentCertificateDto> getCertificates(Long userId) {
        requireUserId(userId);
        return certificateRepository.findByUserIdOrderByIssuedAtDesc(userId).stream()
                .map(this::toCertificateDto)
                .collect(Collectors.toList());
    }

    private StudentAttendanceDto toAttendanceDto(ProgrammeAttendance attendance) {
        StudentAttendanceDto dto = new StudentAttendanceDto();
        dto.setId(attendance.getId());
        dto.setProgrammeId(attendance.getProgramme().getId());
        dto.setProgrammeTitle(attendance.getProgramme().getTitle());
        dto.setSessionLabel(attendance.getSessionLabel());
        dto.setAttendanceStatus(attendance.getAttendanceStatus());
        dto.setCheckedInAt(attendance.getCheckedInAt());
        return dto;
    }

    private StudentMeritRecordDto toMeritDto(StudentMeritRecord record) {
        StudentMeritRecordDto dto = new StudentMeritRecordDto();
        dto.setId(record.getId());
        dto.setProgrammeId(record.getProgramme().getId());
        dto.setProgrammeTitle(record.getProgrammeTitle());
        dto.setCategory(record.getProgramme().getCategory());
        dto.setProgrammeLevel(record.getProgrammeLevel());
        if (record.getProgramme().getStartDate() != null) {
            dto.setStartDate(record.getProgramme().getStartDate().toString());
        }
        if (record.getProgramme().getEndDate() != null) {
            dto.setEndDate(record.getProgramme().getEndDate().toString());
        }
        dto.setMeritRoleType(record.getMeritRoleType());
        dto.setRole(record.getRoleLabel());
        dto.setMeritAwarded(record.getMeritPoints());
        dto.setAcademicYear(record.getAcademicYear());
        dto.setSemester(record.getSemester());
        dto.setStatus(record.getStatus());
        dto.setAwardedAt(record.getAwardedAt());
        return dto;
    }

    private StudentCertificateDto toCertificateDto(StudentCertificate certificate) {
        StudentCertificateDto dto = new StudentCertificateDto();
        dto.setId(certificate.getId());
        dto.setProgrammeId(certificate.getProgramme().getId());
        dto.setProgrammeTitle(certificate.getProgrammeTitle());
        dto.setOrganizerClub(certificate.getOrganizerClub());
        dto.setCertificateType(certificate.getCertificateType());
        dto.setIssuedAt(certificate.getIssuedAt());
        dto.setStatus(certificate.getStatus());
        return dto;
    }

    private void requireUserId(Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required.");
        }
    }
}
