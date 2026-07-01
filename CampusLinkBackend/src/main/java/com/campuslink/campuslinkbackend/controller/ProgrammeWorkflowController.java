package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.ProgrammeDraftRequest;
import com.campuslink.campuslinkbackend.dto.ProgrammeWorkflowResponse;
import com.campuslink.campuslinkbackend.service.ProgrammeWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.campuslink.campuslinkbackend.entity.ProgrammeDocument;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/programmes")
public class ProgrammeWorkflowController {

    @Autowired
    private ProgrammeWorkflowService programmeWorkflowService;

    @PostMapping(value = "/draft", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProgrammeWorkflowResponse saveDraft(
            @RequestPart("programme") ProgrammeDraftRequest request,
            @RequestPart(value = "poster", required = false) MultipartFile poster,
            @RequestPart(value = "applicationPdf", required = false) MultipartFile applicationPdf,
            @RequestPart(value = "paymentQr", required = false) MultipartFile paymentQr,
            @RequestPart(value = "advisorSignature", required = false) MultipartFile advisorSignature,
            @RequestPart(value = "proposalPaper", required = false) MultipartFile proposalPaper,
            @RequestPart(value = "sponsorLetter", required = false) MultipartFile sponsorLetter,
            @RequestPart(value = "riskAssessment", required = false) MultipartFile riskAssessment,
            MultipartHttpServletRequest multipartRequest,
            @RequestParam Long organizerId) {
        return ProgrammeWorkflowResponse.from(
                programmeWorkflowService.saveDraft(
                        request, poster, applicationPdf, paymentQr, advisorSignature,
                        proposalPaper, sponsorLetter, riskAssessment,
                        extractSpeakerCvFiles(multipartRequest), organizerId)
        );
    }

    @PutMapping(value = "/{id}/draft", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProgrammeWorkflowResponse updateDraft(
            @PathVariable Long id,
            @RequestPart("programme") ProgrammeDraftRequest request,
            @RequestPart(value = "poster", required = false) MultipartFile poster,
            @RequestPart(value = "applicationPdf", required = false) MultipartFile applicationPdf,
            @RequestPart(value = "paymentQr", required = false) MultipartFile paymentQr,
            @RequestPart(value = "advisorSignature", required = false) MultipartFile advisorSignature,
            @RequestPart(value = "proposalPaper", required = false) MultipartFile proposalPaper,
            @RequestPart(value = "sponsorLetter", required = false) MultipartFile sponsorLetter,
            @RequestPart(value = "riskAssessment", required = false) MultipartFile riskAssessment,
            MultipartHttpServletRequest multipartRequest,
            @RequestParam Long organizerId) {
        request.setId(id);
        return ProgrammeWorkflowResponse.from(
                programmeWorkflowService.saveDraft(
                        request, poster, applicationPdf, paymentQr, advisorSignature,
                        proposalPaper, sponsorLetter, riskAssessment,
                        extractSpeakerCvFiles(multipartRequest), organizerId)
        );
    }

    private Map<Integer, MultipartFile> extractSpeakerCvFiles(MultipartHttpServletRequest request) {
        Map<Integer, MultipartFile> speakerCvByIndex = new HashMap<>();
        if (request == null) {
            return speakerCvByIndex;
        }
        request.getFileMap().forEach((name, file) -> {
            if (name != null && name.startsWith("speakerCv_") && file != null && !file.isEmpty()) {
                try {
                    speakerCvByIndex.put(Integer.parseInt(name.substring("speakerCv_".length())), file);
                } catch (NumberFormatException ignored) {
                    // Skip malformed speaker CV field names.
                }
            }
        });
        return speakerCvByIndex;
    }

    @DeleteMapping("/{id}/draft")
    public void deleteDraft(@PathVariable Long id, @RequestParam Long organizerId) {
        programmeWorkflowService.deleteDraft(id, organizerId);
    }

    @GetMapping("/{id}/full")
    public Map<String, Object> getFullDetails(@PathVariable Long id) {
        return programmeWorkflowService.getProgrammeFullDetails(id);
    }

    @PostMapping("/{id}/request-advisor-approval")
    public ProgrammeWorkflowResponse requestAdvisorApproval(@PathVariable Long id, @RequestParam Long organizerId) {
        return ProgrammeWorkflowResponse.from(programmeWorkflowService.requestAdvisorApproval(id, organizerId));
    }

    @PostMapping(value = "/{id}/advisor-signed-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProgrammeWorkflowResponse uploadAdvisorSigned(
            @PathVariable Long id,
            @RequestPart("signedPdf") MultipartFile signedPdf,
            @RequestParam Long organizerId) {
        return ProgrammeWorkflowResponse.from(
                programmeWorkflowService.uploadAdvisorSignedPdf(id, signedPdf, organizerId)
        );
    }

    @PostMapping(value = "/{id}/supporting-documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<ProgrammeDocument> uploadSupportingDocuments(
            @PathVariable Long id,
            @RequestPart("documents") MultipartFile[] documents,
            @RequestParam Long organizerId) {
        return programmeWorkflowService.uploadSupportingDocuments(id, documents, organizerId);
    }

    @DeleteMapping("/{id}/supporting-documents/{documentId}")
    public void deleteSupportingDocument(
            @PathVariable Long id,
            @PathVariable Long documentId,
            @RequestParam Long organizerId) {
        programmeWorkflowService.deleteSupportingDocument(id, documentId, organizerId);
    }

    @PostMapping("/{id}/submit-mpp")
    public ProgrammeWorkflowResponse submitToMpp(
            @PathVariable Long id,
            @RequestParam Long organizerId) {
        return ProgrammeWorkflowResponse.from(programmeWorkflowService.submitToMpp(id, null, organizerId));
    }
}
