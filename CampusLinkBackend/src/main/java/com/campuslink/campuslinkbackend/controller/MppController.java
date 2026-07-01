package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.MppDashboardDto;
import com.campuslink.campuslinkbackend.dto.WorkflowProgrammeSummaryDto;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.service.MppService;
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
@RequestMapping("/api/mpp")
public class MppController {

    private final MppService mppService;
    private final ProgrammeCancellationService programmeCancellationService;

    public MppController(MppService mppService, ProgrammeCancellationService programmeCancellationService) {
        this.mppService = mppService;
        this.programmeCancellationService = programmeCancellationService;
    }

    @GetMapping("/me/dashboard")
    public MppDashboardDto dashboard(@RequestParam Long mppId) {
        return mppService.getDashboard(mppId);
    }

    @GetMapping("/me/pending-programmes")
    public List<WorkflowProgrammeSummaryDto> pendingProgrammes(@RequestParam Long mppId) {
        return mppService.getPendingProgrammes(mppId);
    }

    @GetMapping("/me/reviewed-programmes")
    public List<WorkflowProgrammeSummaryDto> reviewedProgrammes(@RequestParam Long mppId) {
        return mppService.getReviewedProgrammes(mppId);
    }

    @PutMapping("/me/programmes/{programmeId}/cancel")
    public Programme cancelPublishedProgramme(
            @PathVariable Long programmeId,
            @RequestParam Long mppId,
            @RequestBody Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return programmeCancellationService.cancelPublishedProgramme(programmeId, mppId, reason);
    }
}
