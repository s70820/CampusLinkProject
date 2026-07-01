package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.AttendanceSessionStateDto;
import com.campuslink.campuslinkbackend.dto.CertificateBulkIssueResultDto;
import com.campuslink.campuslinkbackend.dto.CertificateRenderDto;
import com.campuslink.campuslinkbackend.dto.OrganizerAttendanceDto;
import com.campuslink.campuslinkbackend.dto.OrganizerDashboardDto;
import com.campuslink.campuslinkbackend.dto.OrganizerProgrammeSummaryDto;
import com.campuslink.campuslinkbackend.service.AttendanceService;
import com.campuslink.campuslinkbackend.service.OrganizerCertificateService;
import com.campuslink.campuslinkbackend.service.OrganizerService;
import com.campuslink.campuslinkbackend.service.ProgrammeWorkflowService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/organizers")
public class OrganizerController {

    private final OrganizerService organizerService;
    private final OrganizerCertificateService certificateService;
    private final ProgrammeWorkflowService programmeWorkflowService;
    private final AttendanceService attendanceService;

    public OrganizerController(
            OrganizerService organizerService,
            OrganizerCertificateService certificateService,
            ProgrammeWorkflowService programmeWorkflowService,
            AttendanceService attendanceService) {
        this.organizerService = organizerService;
        this.certificateService = certificateService;
        this.programmeWorkflowService = programmeWorkflowService;
        this.attendanceService = attendanceService;
    }

    @GetMapping("/me/dashboard")
    public OrganizerDashboardDto dashboard(@RequestParam Long organizerId) {
        return organizerService.getDashboard(organizerId);
    }

    @GetMapping("/me/programmes")
    public List<OrganizerProgrammeSummaryDto> programmes(
            @RequestParam Long organizerId,
            @RequestParam(required = false, defaultValue = "false") boolean operationalOnly) {
        return organizerService.getProgrammes(organizerId, operationalOnly);
    }

    @DeleteMapping("/me/programmes/{programmeId}/draft")
    public void deleteDraft(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId) {
        programmeWorkflowService.deleteDraft(programmeId, organizerId);
    }

    @GetMapping("/me/programmes/{programmeId}/attendance")
    public List<OrganizerAttendanceDto> attendance(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId) {
        return organizerService.getProgrammeAttendance(organizerId, programmeId);
    }

    @GetMapping("/me/programmes/{programmeId}/attendance/sessions/current")
    public AttendanceSessionStateDto currentAttendanceSession(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId) {
        return attendanceService.getCurrentSession(organizerId, programmeId);
    }

    @PostMapping("/me/programmes/{programmeId}/attendance/sessions/start")
    public AttendanceSessionStateDto startAttendanceSession(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId) {
        return attendanceService.startSession(organizerId, programmeId);
    }

    @PostMapping("/me/programmes/{programmeId}/attendance/sessions/pause")
    public AttendanceSessionStateDto pauseAttendanceSession(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId) {
        return attendanceService.pauseSession(organizerId, programmeId);
    }

    @PostMapping("/me/programmes/{programmeId}/attendance/sessions/resume")
    public AttendanceSessionStateDto resumeAttendanceSession(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId) {
        return attendanceService.resumeSession(organizerId, programmeId);
    }

    @PostMapping("/me/programmes/{programmeId}/attendance/sessions/end")
    public AttendanceSessionStateDto endAttendanceSession(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId) {
        return attendanceService.endSession(organizerId, programmeId);
    }

    @PostMapping("/me/programmes/{programmeId}/certificates/issue")
    public CertificateRenderDto issueCertificate(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId,
            @RequestParam Long registrationId) {
        return certificateService.issueCertificate(organizerId, programmeId, registrationId);
    }

    @PostMapping("/me/programmes/{programmeId}/certificates/issue-all")
    public CertificateBulkIssueResultDto issueAllCertificates(
            @RequestParam Long organizerId,
            @PathVariable Long programmeId) {
        return certificateService.issueAllCertificates(organizerId, programmeId);
    }
}
