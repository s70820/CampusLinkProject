package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.RoleRequestDto;
import com.campuslink.campuslinkbackend.service.RoleRequestService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/role-requests")
public class RoleRequestController {

    private final RoleRequestService roleRequestService;

    public RoleRequestController(RoleRequestService roleRequestService) {
        this.roleRequestService = roleRequestService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RoleRequestDto submit(
            @RequestParam Long userId,
            @RequestParam String requestedRole,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) String clubName,
            @RequestParam("documents") MultipartFile[] documents) {
        return roleRequestService.submitRequest(userId, requestedRole, reason, clubName, documents);
    }

    @GetMapping("/me")
    public List<RoleRequestDto> myRequests(@RequestParam Long userId) {
        return roleRequestService.getMyRequests(userId);
    }

    @GetMapping(value = "/club-organizer-form/template", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadClubOrganizerTemplate(
            @RequestParam Long userId,
            @RequestParam(required = false) String clubName) {
        byte[] pdf = roleRequestService.buildClubOrganizerFormTemplate(userId, clubName);
        return pdfInlineResponse(pdf, "UMT_Club_Organizer_Approval_Form.pdf");
    }

    @GetMapping(value = "/{requestId}/club-organizer-form", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadClubOrganizerFormForRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {
        byte[] pdf = roleRequestService.buildClubOrganizerFormForRequest(requestId, userId);
        return pdfInlineResponse(pdf, "Club_Organizer_Approval_Form.pdf");
    }

    @GetMapping
    public List<RoleRequestDto> listAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            return roleRequestService.getRequestsByStatus(status);
        }
        return roleRequestService.getAllRequests();
    }

    @PostMapping(value = "/{requestId}/approve", consumes = MediaType.APPLICATION_JSON_VALUE)
    public RoleRequestDto approve(
            @PathVariable Long requestId,
            @RequestParam Long reviewerId,
            @RequestBody(required = false) Map<String, String> body) {
        String reviewNotes = body != null ? body.get("reviewNotes") : null;
        return roleRequestService.approveRequest(requestId, reviewerId, reviewNotes, null);
    }

    @PostMapping(value = "/{requestId}/approve", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RoleRequestDto approveWithDocument(
            @PathVariable Long requestId,
            @RequestParam Long reviewerId,
            @RequestParam(required = false) String reviewNotes,
            @RequestPart(value = "hepaSignedDocument", required = false) MultipartFile hepaSignedDocument) {
        return roleRequestService.approveRequest(requestId, reviewerId, reviewNotes, hepaSignedDocument);
    }

    @PostMapping("/{requestId}/reject")
    public RoleRequestDto reject(
            @PathVariable Long requestId,
            @RequestParam Long reviewerId,
            @RequestBody Map<String, String> body) {
        String reviewNotes = body != null ? body.get("reviewNotes") : null;
        return roleRequestService.rejectRequest(requestId, reviewerId, reviewNotes);
    }

    @PostMapping("/{requestId}/revoke")
    public RoleRequestDto revoke(
            @PathVariable Long requestId,
            @RequestParam Long reviewerId,
            @RequestBody Map<String, String> body) {
        String reviewNotes = body != null ? body.get("reviewNotes") : null;
        return roleRequestService.revokeApprovedRequest(requestId, reviewerId, reviewNotes);
    }

    private ResponseEntity<byte[]> pdfInlineResponse(byte[] pdf, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
