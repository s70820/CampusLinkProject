package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.dto.MppReviewRequest;
import com.campuslink.campuslinkbackend.dto.ProgrammeBrowseDto;
import com.campuslink.campuslinkbackend.dto.ProgrammeRegistrationAvailabilityDto;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.service.StudentProgrammeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Student browse and MPP/HEPA programme approval actions.
 * Organizer draft/submit flows live in {@link ProgrammeWorkflowController}.
 */
@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/programmes")
public class ProgrammeController {

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private StudentProgrammeService studentProgrammeService;

    @GetMapping("/browse")
    public List<ProgrammeBrowseDto> browseApprovedProgrammes(
            @RequestParam(required = false) Long userId) {
        return studentProgrammeService.getApprovedProgrammesForBrowse(userId);
    }

    @GetMapping("/browse/{id}")
    public ResponseEntity<ProgrammeBrowseDto> browseApprovedProgrammeById(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        ProgrammeBrowseDto programme = studentProgrammeService.getApprovedProgrammeById(id, userId);
        return programme == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(programme);
    }

    @GetMapping("/browse/{id}/availability")
    public ProgrammeRegistrationAvailabilityDto browseAvailability(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        return studentProgrammeService.getRegistrationAvailability(id, userId);
    }

    @PutMapping("/{id}/mpp-approve")
    public ResponseEntity<?> approveByMpp(
            @PathVariable Long id,
            @RequestBody(required = false) MppReviewRequest request) {

        Optional<Programme> programmeOptional = programmeRepository.findById(id);
        if (programmeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Programme programme = programmeOptional.get();
        if (!WorkflowStatus.PENDING_MPP_REVIEW.equals(programme.getStatus())
                && !WorkflowStatus.PENDING_MPP.equals(programme.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only programmes pending MPP review can be approved."));
        }

        programme.setMppStatus("APPROVED");
        programme.setStatus("PENDING_HEPA");
        if (request != null && request.getRemarks() != null && !request.getRemarks().isBlank()) {
            programme.setMppRemarks(request.getRemarks());
        }

        return ResponseEntity.ok(programmeRepository.save(programme));
    }

    @PutMapping("/{id}/mpp-reject")
    public ResponseEntity<?> rejectByMpp(
            @PathVariable Long id,
            @RequestBody(required = false) MppReviewRequest request) {

        Optional<Programme> programmeOptional = programmeRepository.findById(id);
        if (programmeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Programme programme = programmeOptional.get();
        if (!WorkflowStatus.PENDING_MPP_REVIEW.equals(programme.getStatus())
                && !WorkflowStatus.PENDING_MPP.equals(programme.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only programmes with status PENDING_MPP can be rejected by MPP."));
        }

        programme.setMppStatus("REJECTED");
        programme.setStatus("REJECTED");
        if (request != null && request.getRemarks() != null && !request.getRemarks().isBlank()) {
            programme.setMppRemarks(request.getRemarks());
        }

        return ResponseEntity.ok(programmeRepository.save(programme));
    }

    @PutMapping("/{id}/hepa-approve")
    public ResponseEntity<?> approveByHepa(
            @PathVariable Long id,
            @RequestBody(required = false) MppReviewRequest request) {

        Optional<Programme> programmeOptional = programmeRepository.findById(id);
        if (programmeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Programme programme = programmeOptional.get();
        if (!WorkflowStatus.PENDING_HEPA.equals(programme.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only programmes pending HEPA approval can be approved."));
        }

        programme.setHepaStatus("APPROVED");
        programme.setStatus("APPROVED");
        if (request != null && request.getRemarks() != null && !request.getRemarks().isBlank()) {
            programme.setHepaRemarks(request.getRemarks());
        }

        programme = programmeRepository.save(programme);
        return ResponseEntity.ok(programme);
    }

    @PutMapping("/{id}/hepa-reject")
    public ResponseEntity<?> rejectByHepa(
            @PathVariable Long id,
            @RequestBody(required = false) MppReviewRequest request) {

        Optional<Programme> programmeOptional = programmeRepository.findById(id);
        if (programmeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Programme programme = programmeOptional.get();
        if (!WorkflowStatus.PENDING_HEPA.equals(programme.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Only programmes pending HEPA approval can be rejected."));
        }

        programme.setHepaStatus("REJECTED");
        programme.setStatus("REJECTED");
        if (request != null && request.getRemarks() != null && !request.getRemarks().isBlank()) {
            programme.setHepaRemarks(request.getRemarks());
        }

        return ResponseEntity.ok(programmeRepository.save(programme));
    }
}
