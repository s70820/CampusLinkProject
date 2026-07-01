package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.RegistrationResponseDto;
import com.campuslink.campuslinkbackend.dto.TeamRegistrationDetailDto;
import com.campuslink.campuslinkbackend.dto.TeammateInviteDto;
import com.campuslink.campuslinkbackend.service.RegistrationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final ObjectMapper objectMapper;

    public RegistrationController(RegistrationService registrationService, ObjectMapper objectMapper) {
        this.registrationService = registrationService;
        this.objectMapper = objectMapper;
    }

    @PostMapping(value = "/individual", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RegistrationResponseDto registerIndividual(
            @RequestParam Long userId,
            @RequestParam Long programmeId,
            @RequestParam(required = false) String paymentReference,
            @RequestParam(required = false) String customResponses,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt) {
        return registrationService.registerIndividual(userId, programmeId, paymentReference, receipt, customResponses);
    }

    @PostMapping(value = "/team", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RegistrationResponseDto registerTeam(
            @RequestParam Long userId,
            @RequestParam Long programmeId,
            @RequestParam String teamName,
            @RequestParam(required = false) String paymentReference,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @RequestParam(required = false) String customResponses,
            @RequestPart(value = "teammates", required = false) String teammatesJson) throws Exception {
        List<TeammateInviteDto> teammates = teammatesJson == null || teammatesJson.isBlank()
                ? Collections.emptyList()
                : objectMapper.readValue(teammatesJson, new TypeReference<List<TeammateInviteDto>>() {});
        return registrationService.registerTeam(
                userId, programmeId, teamName, teammates, paymentReference, receipt, customResponses);
    }

    @GetMapping("/me")
    public List<RegistrationResponseDto> myRegistrations(@RequestParam Long userId) {
        return registrationService.getMyRegistrations(userId);
    }

    @GetMapping("/programme/{programmeId}")
    public List<RegistrationResponseDto> programmeRegistrations(@PathVariable Long programmeId) {
        return registrationService.getProgrammeRegistrations(programmeId);
    }

    @GetMapping("/teams/me")
    public List<TeamRegistrationDetailDto> myTeamRegistrations(@RequestParam Long userId) {
        return registrationService.getMyTeamRegistrations(userId);
    }

    @GetMapping("/teams/{teamRegistrationId}")
    public TeamRegistrationDetailDto teamRegistration(
            @PathVariable Long teamRegistrationId,
            @RequestParam Long userId) {
        return registrationService.getTeamRegistration(userId, teamRegistrationId);
    }

    @PostMapping("/team-invites/{memberId}/accept")
    public RegistrationResponseDto acceptInvite(
            @PathVariable Long memberId,
            @RequestParam Long userId) {
        return registrationService.acceptTeamInvite(userId, memberId);
    }

    @PostMapping("/team-invites/{memberId}/reject")
    public Map<String, String> rejectInvite(
            @PathVariable Long memberId,
            @RequestParam Long userId) {
        registrationService.rejectTeamInvite(userId, memberId);
        return Map.of("message", "Invitation rejected.");
    }

    @PutMapping("/{registrationId}/payment/approve")
    public RegistrationResponseDto approvePayment(
            @PathVariable Long registrationId,
            @RequestParam Long organizerId,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        return registrationService.approvePayment(organizerId, registrationId, remarks);
    }

    @PutMapping("/{registrationId}/payment/reject")
    public RegistrationResponseDto rejectPayment(
            @PathVariable Long registrationId,
            @RequestParam Long organizerId,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        return registrationService.rejectPayment(organizerId, registrationId, remarks);
    }
}
