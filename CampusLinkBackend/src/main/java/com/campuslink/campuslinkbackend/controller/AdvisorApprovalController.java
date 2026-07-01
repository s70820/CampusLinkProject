package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.entity.AdvisorApproval;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.repository.AdvisorApprovalRepository;
import com.campuslink.campuslinkbackend.service.ProgrammeWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/advisor-approval")
public class AdvisorApprovalController {

    @Autowired
    private AdvisorApprovalRepository advisorApprovalRepository;

    @Autowired
    private ProgrammeWorkflowService programmeWorkflowService;

    @GetMapping("/token/{token}")
    public Map<String, Object> getApprovalRequest(@PathVariable String token) {
        AdvisorApproval approval = advisorApprovalRepository.findByApprovalToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid token."));

        Programme programme = approval.getProgramme();
        Map<String, Object> response = new HashMap<>();
        response.put("advisorName", approval.getAdvisorName());
        response.put("status", approval.getStatus());
        response.put("programmeTitle", programme.getTitle());
        response.put("organizerClub", programme.getOrganizerClub());
        response.put("programmeLevel", programme.getProgrammeLevel());
        return response;
    }

    @PostMapping("/token/{token}/approve")
    public Programme approveOnline(@PathVariable String token, @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        return programmeWorkflowService.approveAdvisorOnline(token, remarks);
    }
}
