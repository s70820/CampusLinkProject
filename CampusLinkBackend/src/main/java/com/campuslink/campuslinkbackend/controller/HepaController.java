package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.HepaDashboardDto;
import com.campuslink.campuslinkbackend.dto.HepaReportsDto;
import com.campuslink.campuslinkbackend.dto.WorkflowProgrammeSummaryDto;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.service.HepaService;
import com.campuslink.campuslinkbackend.service.ProgrammeCancellationService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/hepa")
public class HepaController {

    private final HepaService hepaService;
    private final ProgrammeCancellationService programmeCancellationService;

    public HepaController(HepaService hepaService, ProgrammeCancellationService programmeCancellationService) {
        this.hepaService = hepaService;
        this.programmeCancellationService = programmeCancellationService;
    }

    @GetMapping("/me/dashboard")
    public HepaDashboardDto dashboard(@RequestParam Long hepaId) {
        return hepaService.getDashboard(hepaId);
    }

    @GetMapping("/me/pending-programmes")
    public List<WorkflowProgrammeSummaryDto> pendingProgrammes(@RequestParam Long hepaId) {
        return hepaService.getPendingProgrammes(hepaId);
    }

    @GetMapping("/me/reviewed-programmes")
    public List<WorkflowProgrammeSummaryDto> reviewedProgrammes(@RequestParam Long hepaId) {
        return hepaService.getReviewedProgrammes(hepaId);
    }

    @GetMapping("/me/reports")
    public HepaReportsDto reports(@RequestParam Long hepaId) {
        return hepaService.getReports(hepaId);
    }

    @PutMapping("/me/programmes/{programmeId}/cancel")
    public Programme cancelPublishedProgramme(
            @PathVariable Long programmeId,
            @RequestParam Long hepaId,
            @RequestBody Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return programmeCancellationService.cancelPublishedProgramme(programmeId, hepaId, reason);
    }
}
