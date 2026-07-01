package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.CertificateRenderDto;
import com.campuslink.campuslinkbackend.dto.MatricRegistryResponse;
import com.campuslink.campuslinkbackend.dto.StudentLookupResponse;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.dto.StudentAttendanceDto;
import com.campuslink.campuslinkbackend.dto.StudentCertificateDto;
import com.campuslink.campuslinkbackend.dto.StudentDashboardStatsDto;
import com.campuslink.campuslinkbackend.dto.StudentMeritRecordDto;
import com.campuslink.campuslinkbackend.dto.AttendanceCheckInRequest;
import com.campuslink.campuslinkbackend.dto.AttendanceCheckInResultDto;
import com.campuslink.campuslinkbackend.dto.AttendanceSessionStateDto;
import com.campuslink.campuslinkbackend.service.AttendanceService;
import com.campuslink.campuslinkbackend.service.OrganizerCertificateService;
import com.campuslink.campuslinkbackend.service.RoleRequestService;
import com.campuslink.campuslinkbackend.service.StudentLookupService;
import com.campuslink.campuslinkbackend.service.StudentPortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentLookupService studentLookupService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentPortalService studentPortalService;

    @Autowired
    private OrganizerCertificateService organizerCertificateService;

    @Autowired
    private RoleRequestService roleRequestService;

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/me/dashboard-stats")
    public StudentDashboardStatsDto dashboardStats(@RequestParam Long userId) {
        return studentPortalService.getDashboardStats(userId);
    }

    @GetMapping("/me/attendance")
    public java.util.List<StudentAttendanceDto> myAttendance(@RequestParam Long userId) {
        return studentPortalService.getAttendanceHistory(userId);
    }

    @GetMapping("/me/attendance/active-sessions")
    public java.util.List<AttendanceSessionStateDto> activeAttendanceSessions(@RequestParam Long userId) {
        return attendanceService.getActiveSessionsForStudent(userId);
    }

    @PostMapping("/me/attendance/check-in")
    public AttendanceCheckInResultDto checkIn(
            @RequestParam Long userId,
            @RequestBody AttendanceCheckInRequest request) {
        return attendanceService.checkIn(userId, request != null ? request.getQrPayload() : null);
    }

    @GetMapping("/me/merit-records")
    public java.util.List<StudentMeritRecordDto> myMeritRecords(@RequestParam Long userId) {
        return studentPortalService.getMeritRecords(userId);
    }

    @GetMapping("/me/certificates")
    public java.util.List<StudentCertificateDto> myCertificates(@RequestParam Long userId) {
        return studentPortalService.getCertificates(userId);
    }

    @GetMapping("/me/certificates/{certificateId}/render")
    public CertificateRenderDto certificateRender(
            @RequestParam Long userId,
            @PathVariable Long certificateId) {
        return organizerCertificateService.getStudentCertificateRender(userId, certificateId);
    }

    @GetMapping("/me/profile")
    public Map<String, Object> myProfile(@RequestParam Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        user = roleRequestService.syncUserRoleFromApprovals(user);
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("matricNumber", user.getMatricNumber());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("faculty", user.getFaculty());
        profile.put("role", user.getRole() != null ? user.getRole() : "STUDENT");
        profile.put("approvalStatus", user.getApprovalStatus() != null ? user.getApprovalStatus() : "APPROVED");
        profile.put("clubName", user.getClubName() != null ? user.getClubName() : "");
        String studyLevel = studentLookupService.resolveStudyLevelForUser(user);
        if (studyLevel != null) {
            profile.put("studyLevel", studyLevel);
        }
        if ((user.getFaculty() == null || user.getFaculty().isBlank())
                && user.getMatricNumber() != null
                && !user.getMatricNumber().isBlank()) {
            MatricRegistryResponse registry = studentLookupService.checkRegistry(user.getMatricNumber());
            if (registry.isFound() && registry.getFaculty() != null) {
                profile.put("faculty", registry.getFaculty());
            }
        }
        return profile;
    }

    @GetMapping("/matric/{matricNumber}")
    public StudentLookupResponse lookupByMatric(
            @PathVariable String matricNumber,
            @RequestParam(name = "teamInvite", defaultValue = "false") boolean teamInvite,
            @RequestParam(name = "programmeId", required = false) Long programmeId) {
        return teamInvite
                ? studentLookupService.lookupRegisteredParticipantForTeam(matricNumber, programmeId)
                : studentLookupService.lookupByMatric(matricNumber);
    }

    /**
     * Prototype matric validation against student_registry.
     * Future production: UMT SSO should verify identity automatically.
     */
    @GetMapping("/registry/{matricNumber}")
    public com.campuslink.campuslinkbackend.dto.MatricRegistryResponse checkRegistry(
            @PathVariable String matricNumber
    ) {
        return studentLookupService.checkRegistry(matricNumber);
    }
}
