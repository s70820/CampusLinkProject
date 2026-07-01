package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.CommitteeRole;
import com.campuslink.campuslinkbackend.constants.DocumentType;
import com.campuslink.campuslinkbackend.constants.DraftPolicy;
import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.dto.AdvisorAssignRequest;
import com.campuslink.campuslinkbackend.dto.BudgetLineDto;
import com.campuslink.campuslinkbackend.dto.CommitteeMemberDto;
import com.campuslink.campuslinkbackend.dto.ProgrammeCustomFieldDto;
import com.campuslink.campuslinkbackend.dto.ProgrammeDraftRequest;
import com.campuslink.campuslinkbackend.dto.SpeakerDto;
import com.campuslink.campuslinkbackend.dto.TentativeItemDto;
import com.campuslink.campuslinkbackend.entity.*;
import com.campuslink.campuslinkbackend.repository.*;
import com.campuslink.campuslinkbackend.util.FileUrlHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgrammeWorkflowService {

    private static final int MAX_SUPPORTING_DOCUMENTS = 5;

    @Autowired
    private ProgrammeRepository programmeRepository;
    @Autowired
    private ProgrammeCommitteeRepository committeeRepository;
    @Autowired
    private ProgrammeSdgRepository sdgRepository;
    @Autowired
    private AdvisorApprovalRepository advisorApprovalRepository;
    @Autowired
    private ProgrammeDocumentRepository documentRepository;
    @Autowired
    private WorkflowHistoryRepository workflowHistoryRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentLookupService studentLookupService;
    @Autowired
    private MeritRuleService meritRuleService;
    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private StudentNotificationRepository notificationRepository;
    @Autowired
    private ProgrammeBudgetLineRepository budgetLineRepository;
    @Autowired
    private ProgrammeTentativeRepository tentativeRepository;
    @Autowired
    private ProgrammeSpeakerRepository speakerRepository;

    @Transactional
    public Programme saveDraft(ProgrammeDraftRequest request, MultipartFile poster,
                             MultipartFile applicationPdf, MultipartFile paymentQr,
                             MultipartFile advisorSignature, MultipartFile proposalPaper,
                             MultipartFile sponsorLetter, MultipartFile riskAssessment,
                             Map<Integer, MultipartFile> speakerCvByIndex, Long organizerId) {
        Programme programme = request.getId() != null
                ? programmeRepository.findById(request.getId()).orElse(new Programme())
                : new Programme();

        if (request.getId() != null && programme.getId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme not found.");
        }

        copyProgrammeFields(request, programme);
        programme.setStatus(WorkflowStatus.DRAFT);
        programme.setDraftExpiryWarningSentAt(null);
        programme.setMppStatus("PENDING");
        programme.setOrganizer(userRepository.findById(organizerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizer not found.")));

        programme = programmeRepository.save(programme);
        saveCommittee(programme, request.getCommitteeMembers());
        saveSdgs(programme, request.getSdgNumbers());
        saveAdvisor(programme, request.getAdvisor());
        saveBudgetLines(programme, request.getBudgetLines());
        saveTentativeSchedule(programme, request.getTentativeSchedule());
        saveSpeakers(programme, request.getSpeakers(), speakerCvByIndex);

        if (poster != null && !poster.isEmpty()) {
            String path = fileStorageService.store(poster, "posters");
            programme.setPosterPath(path);
            saveDocument(programme, DocumentType.POSTER, path, poster.getOriginalFilename());
        }

        if (applicationPdf != null && !applicationPdf.isEmpty()) {
            String path = fileStorageService.store(applicationPdf, "application-pdfs");
            saveDocument(programme, DocumentType.APPLICATION_PDF, path, applicationPdf.getOriginalFilename());
        }

        if (paymentQr != null && !paymentQr.isEmpty()) {
            String path = fileStorageService.store(paymentQr, "payment-qr");
            programme.setPaymentQrPath(path);
        }

        if (advisorSignature != null && !advisorSignature.isEmpty()) {
            String path = fileStorageService.store(advisorSignature, "advisor-signatures");
            programme.setAdvisorSignaturePath(path);
        }

        if (proposalPaper != null && !proposalPaper.isEmpty()) {
            String path = fileStorageService.store(proposalPaper, "proposal-papers");
            saveDocument(programme, DocumentType.PROPOSAL_PAPER, path, proposalPaper.getOriginalFilename());
        }

        if (sponsorLetter != null && !sponsorLetter.isEmpty()) {
            String path = fileStorageService.store(sponsorLetter, "sponsor-letters");
            saveDocument(programme, DocumentType.SPONSOR_LETTER, path, sponsorLetter.getOriginalFilename());
        }

        if (riskAssessment != null && !riskAssessment.isEmpty()) {
            String path = fileStorageService.store(riskAssessment, "risk-assessments");
            saveDocument(programme, DocumentType.RISK_ASSESSMENT, path, riskAssessment.getOriginalFilename());
        }

        int totalMerit = meritRuleService.buildPreview(
                programme.getProgrammeLevel(),
                request.getCommitteeMembers()
        ).getTotalMerit();
        programme.setMeritPoints(totalMerit);

        programme = programmeRepository.save(programme);
        recordHistory(programme, null, WorkflowStatus.DRAFT, "SAVE_DRAFT", organizerId, null);
        return programme;
    }

    @Transactional
    public Programme requestAdvisorApproval(Long programmeId, Long organizerId) {
        Programme programme = getProgrammeOrThrow(programmeId);
        validateAdvisorSubmission(programme);

        String from = programme.getStatus();
        programme.setStatus(WorkflowStatus.PENDING_ADVISOR_APPROVAL);
        programme = programmeRepository.save(programme);

        AdvisorApproval approval = advisorApprovalRepository.findByProgrammeId(programmeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Advisor not assigned."));

        if (approval.getApprovalToken() == null) {
            approval.setApprovalToken(UUID.randomUUID().toString());
        }
        approval.setStatus("PENDING");
        approval.setApprovalMethod(
                approval.getApprovalMethod() != null ? approval.getApprovalMethod() : "ONLINE"
        );
        advisorApprovalRepository.save(approval);

        recordHistory(programme, from, WorkflowStatus.PENDING_ADVISOR_APPROVAL,
                "REQUEST_ADVISOR_APPROVAL", organizerId, null);
        return programme;
    }

    @Transactional
    public Programme approveAdvisorOnline(String token, String remarks) {
        AdvisorApproval approval = advisorApprovalRepository.findByApprovalToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid approval token."));

        Programme programme = approval.getProgramme();
        String from = programme.getStatus();

        approval.setStatus("APPROVED");
        approval.setApprovalMethod("ONLINE");
        approval.setRemarks(remarks);
        approval.setApprovedAt(LocalDateTime.now());
        advisorApprovalRepository.save(approval);

        programme.setStatus(WorkflowStatus.ADVISOR_APPROVED);
        programme = programmeRepository.save(programme);
        recordHistory(programme, from, WorkflowStatus.ADVISOR_APPROVED, "ADVISOR_APPROVED_ONLINE", null, remarks);
        return programme;
    }

    @Transactional
    public Programme uploadAdvisorSignedPdf(Long programmeId, MultipartFile signedPdf, Long organizerId) {
        Programme programme = getProgrammeOrThrow(programmeId);
        if (programme.getOrganizer() == null || !organizerId.equals(programme.getOrganizer().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only upload files for your own programmes.");
        }
        if (signedPdf == null || signedPdf.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Signed PDF is required.");
        }

        String path = fileStorageService.store(signedPdf, "advisor-forms");
        programme.setAdvisorSignedFormPath(path);
        saveDocument(programme, DocumentType.ADVISOR_SIGNED, path, signedPdf.getOriginalFilename());

        final Programme programmeRef = programme;
        AdvisorApproval approval = advisorApprovalRepository.findByProgrammeId(programmeId)
                .orElseGet(() -> {
                    AdvisorApproval a = new AdvisorApproval();
                    a.setProgramme(programmeRef);
                    a.setAdvisorName("Club Advisor");
                    return a;
                });

        String from = programme.getStatus();
        approval.setStatus("APPROVED");
        approval.setApprovalMethod("OFFLINE");
        approval.setSignedDocumentPath(path);
        approval.setApprovedAt(LocalDateTime.now());
        advisorApprovalRepository.save(approval);

        programme.setStatus(WorkflowStatus.DRAFT);
        programme = programmeRepository.save(programme);
        recordHistory(programme, from, WorkflowStatus.DRAFT, "ADVISOR_SIGNED_UPLOAD", organizerId, null);
        return programme;
    }

    @Transactional
    public List<ProgrammeDocument> uploadSupportingDocuments(Long programmeId, MultipartFile[] documents,
                                                             Long organizerId) {
        Programme programme = getProgrammeOrThrow(programmeId);
        assertOrganizerOwnsProgramme(programme, organizerId);

        List<MultipartFile> uploads = normalizeUploadedFiles(documents);
        if (uploads.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one supporting document is required.");
        }

        long existingCount = documentRepository
                .findAllByProgrammeIdAndDocumentType(programmeId, DocumentType.SUPPORTING)
                .size();
        if (existingCount + uploads.size() > MAX_SUPPORTING_DOCUMENTS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You can upload up to " + MAX_SUPPORTING_DOCUMENTS + " optional supporting documents.");
        }

        List<ProgrammeDocument> saved = new ArrayList<>();
        for (MultipartFile file : uploads) {
            String path = fileStorageService.store(file, "supporting-documents");
            ProgrammeDocument doc = new ProgrammeDocument();
            doc.setProgramme(programme);
            doc.setDocumentType(DocumentType.SUPPORTING);
            doc.setFilePath(path);
            doc.setFileName(file.getOriginalFilename());
            saved.add(documentRepository.save(doc));
        }

        recordHistory(programme, programme.getStatus(), programme.getStatus(),
                "SUPPORTING_DOCS_UPLOAD", organizerId, uploads.size() + " file(s)");
        return saved;
    }

    @Transactional
    public void deleteSupportingDocument(Long programmeId, Long documentId, Long organizerId) {
        Programme programme = getProgrammeOrThrow(programmeId);
        assertOrganizerOwnsProgramme(programme, organizerId);

        ProgrammeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found."));
        if (document.getProgramme() == null || !programmeId.equals(document.getProgramme().getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found.");
        }
        if (!DocumentType.SUPPORTING.equals(document.getDocumentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only optional supporting documents can be removed.");
        }

        documentRepository.delete(document);
        recordHistory(programme, programme.getStatus(), programme.getStatus(),
                "SUPPORTING_DOC_DELETE", organizerId, document.getFileName());
    }

    @Transactional
    public Programme submitToMpp(Long programmeId, MultipartFile signedPdf, Long organizerId) {
        Programme programme = getProgrammeOrThrow(programmeId);
        if (programme.getOrganizer() == null || !organizerId.equals(programme.getOrganizer().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only submit your own programmes.");
        }

        if (signedPdf != null && !signedPdf.isEmpty()) {
            uploadAdvisorSignedPdf(programmeId, signedPdf, organizerId);
            programmeRepository.flush();
        }

        programme = getProgrammeOrThrow(programmeId);
        validateMppSubmission(programme);

        String from = programme.getStatus();
        programme.setStatus(WorkflowStatus.PENDING_MPP_REVIEW);
        programme.setMppStatus("PENDING");
        programme = programmeRepository.save(programme);

        recordHistory(programme, from, WorkflowStatus.PENDING_MPP_REVIEW, "SUBMIT_MPP", organizerId, null);
        return programme;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProgrammeFullDetails(Long programmeId) {
        Programme programme = getProgrammeOrThrow(programmeId);
        normalizeProgrammeFileFields(programme);
        List<ProgrammeDocument> documents = documentRepository.findByProgrammeId(programmeId);
        documents.forEach(doc -> doc.setFilePath(FileUrlHelper.toPublicUrl(doc.getFilePath())));
        List<ProgrammeSpeaker> speakers = speakerRepository.findByProgrammeIdOrderBySortOrderAsc(programmeId);
        speakers.forEach(speaker -> speaker.setCvPath(FileUrlHelper.toPublicUrl(speaker.getCvPath())));

        Map<String, Object> details = new HashMap<>();
        details.put("programme", programme);
        details.put("committee", committeeRepository.findByProgrammeId(programmeId));
        details.put("sdgs", sdgRepository.findByProgrammeId(programmeId));
        details.put("documents", documents);
        details.put("budgetLines", budgetLineRepository.findByProgrammeIdOrderBySortOrderAsc(programmeId));
        details.put("tentativeSchedule", tentativeRepository.findByProgrammeIdOrderBySortOrderAsc(programmeId));
        details.put("speakers", speakers);
        details.put("advisorApproval", advisorApprovalRepository.findByProgrammeId(programmeId).orElse(null));
        if (programme.getProgrammeLevel() != null && !programme.getProgrammeLevel().isBlank()) {
            details.put("meritPreview", meritRuleService.buildPreview(
                    programme.getProgrammeLevel(),
                    committeeRepository.findByProgrammeId(programmeId).stream().map(c -> {
                        CommitteeMemberDto dto = new CommitteeMemberDto();
                        dto.setMatricNumber(c.getMatricNumber());
                        dto.setFullName(c.getFullName());
                        dto.setFaculty(c.getFaculty());
                        dto.setCommitteeRole(c.getCommitteeRole());
                        dto.setPositionLabel(c.getPositionLabel());
                        dto.setContributionDescription(c.getContributionDescription());
                        return dto;
                    }).collect(Collectors.toList())
            ));
        }
        return details;
    }

    public void validateAdvisorSubmission(Programme programme) {
        List<String> errors = collectAdvisorSubmissionErrors(programme);
        if (!errors.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, String.join(" ", errors));
        }
    }

    public void validateMppSubmission(Programme programme) {
        List<String> errors = new ArrayList<>();
        errors.addAll(collectAdvisorSubmissionErrors(programme));
        errors.addAll(collectRegistrationErrors(programme));

        AdvisorApproval approval = advisorApprovalRepository.findByProgrammeId(programme.getId())
                .orElse(null);

        boolean advisorSigned = approval != null && "APPROVED".equalsIgnoreCase(approval.getStatus());
        boolean hasSignedPdf = programme.getAdvisorSignedFormPath() != null
                || hasDocument(programme.getId(), DocumentType.ADVISOR_SIGNED);

        if (!advisorSigned && !hasSignedPdf) {
            errors.add("Attach the advisor-signed programme form before submitting to MPP.");
        }

        if (!WorkflowStatus.DRAFT.equalsIgnoreCase(programme.getStatus())
                && !WorkflowStatus.PENDING_ADVISOR_APPROVAL.equalsIgnoreCase(programme.getStatus())
                && !WorkflowStatus.ADVISOR_APPROVED.equalsIgnoreCase(programme.getStatus())) {
            errors.add("Only draft programmes can be submitted from the organizer form.");
        }

        if (!errors.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, String.join(" ", errors));
        }
    }

    private List<String> collectAdvisorSubmissionErrors(Programme programme) {
        List<String> errors = new ArrayList<>();
        if (programme.getPosterPath() == null && !hasDocument(programme.getId(), DocumentType.POSTER)) {
            errors.add("Poster must be uploaded.");
        }

        boolean hasSignedPdf = programme.getAdvisorSignedFormPath() != null
                || hasDocument(programme.getId(), DocumentType.ADVISOR_SIGNED);
        if (!hasDocument(programme.getId(), DocumentType.APPLICATION_PDF) && !hasSignedPdf) {
            errors.add("Download the programme form and attach the advisor-signed PDF before submitting.");
        }

        if (committeeRepository.findByProgrammeId(programme.getId()).isEmpty()) {
            errors.add("Committee must be completed.");
        }
        if (!advisorApprovalRepository.findByProgrammeId(programme.getId()).isPresent()) {
            errors.add("Club advisor must be assigned.");
        }
        return errors;
    }

    private List<String> collectRegistrationErrors(Programme programme) {
        List<String> errors = new ArrayList<>();

        if (Boolean.TRUE.equals(programme.getIsPaid())) {
            if (programme.getRegistrationFee() == null || programme.getRegistrationFee().signum() <= 0) {
                errors.add("Registration fee is required for paid programmes.");
            }
            if (programme.getPaymentReferenceFormat() == null || programme.getPaymentReferenceFormat().isBlank()) {
                errors.add("Payment reference format is required for paid programmes.");
            }
            if (programme.getPaymentInstructions() == null || programme.getPaymentInstructions().isBlank()) {
                errors.add("Payment instructions are required for paid programmes.");
            }
        }

        if (Boolean.TRUE.equals(programme.getIsTeamProgramme())) {
            if (programme.getMinTeamSize() == null || programme.getMinTeamSize() < 1) {
                errors.add("Minimum team size is required for team-based programmes.");
            }
            if (programme.getMaxTeamSize() == null || programme.getMaxTeamSize() < 1) {
                errors.add("Maximum team size is required for team-based programmes.");
            }
            if (programme.getMinTeamSize() != null && programme.getMaxTeamSize() != null
                    && programme.getMinTeamSize() > programme.getMaxTeamSize()) {
                errors.add("Minimum team size cannot exceed maximum team size.");
            }
        }

        return errors;
    }

    private void validateRegistrationSettings(Programme programme) {
        List<String> errors = collectRegistrationErrors(programme);
        if (!errors.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, String.join(" ", errors));
        }
    }

    @Transactional
    public void deleteDraft(Long programmeId, Long organizerId) {
        Programme programme = getProgrammeOrThrow(programmeId);
        if (programme.getOrganizer() == null || !organizerId.equals(programme.getOrganizer().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own programme drafts.");
        }
        if (!WorkflowStatus.DRAFT.equalsIgnoreCase(programme.getStatus())
                && !WorkflowStatus.PENDING_ADVISOR_APPROVAL.equalsIgnoreCase(programme.getStatus())
                && !WorkflowStatus.ADVISOR_APPROVED.equalsIgnoreCase(programme.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only draft programmes can be deleted.");
        }

        Long id = programme.getId();
        committeeRepository.deleteByProgrammeId(id);
        sdgRepository.deleteByProgrammeId(id);
        advisorApprovalRepository.findByProgrammeId(id).ifPresent(advisorApprovalRepository::delete);
        documentRepository.findByProgrammeId(id).forEach(documentRepository::delete);
        workflowHistoryRepository.findByProgrammeIdOrderByCreatedAtDesc(id)
                .forEach(workflowHistoryRepository::delete);
        programmeRepository.delete(programme);
    }

    @Transactional
    public void sendDraftExpiryWarnings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningThreshold = now.minusDays(
                DraftPolicy.RETENTION_DAYS - DraftPolicy.WARNING_DAYS_BEFORE_EXPIRY);
        LocalDateTime expiryThreshold = now.minusDays(DraftPolicy.RETENTION_DAYS);

        List<Programme> draftsNeedingWarning = programmeRepository
                .findByStatusAndUpdatedAtBeforeAndUpdatedAtAfterAndDraftExpiryWarningSentAtIsNull(
                        WorkflowStatus.DRAFT, warningThreshold, expiryThreshold);

        for (Programme programme : draftsNeedingWarning) {
            User organizer = programme.getOrganizer();
            if (organizer == null) {
                continue;
            }

            String title = programme.getTitle() != null && !programme.getTitle().isBlank()
                    ? programme.getTitle()
                    : "Untitled draft";

            StudentNotification notification = new StudentNotification();
            notification.setUser(organizer);
            notification.setNotificationType("DRAFT_EXPIRY_WARNING");
            notification.setTitle("Draft programme expiring soon");
            notification.setMessage(
                    "Your draft \"" + title + "\" has not been updated in over "
                            + DraftPolicy.WARNING_DAYS_BEFORE_EXPIRY
                            + " days. It will be automatically deleted in "
                            + DraftPolicy.WARNING_DAYS_BEFORE_EXPIRY
                            + " days unless you continue editing or save it again.");
            notification.setReferenceType("PROGRAMME_DRAFT");
            notification.setReferenceId(programme.getId());
            notificationRepository.save(notification);

            programme.setDraftExpiryWarningSentAt(now);
            programmeRepository.save(programme);
        }
    }

    @Transactional
    public void purgeExpiredDrafts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(DraftPolicy.RETENTION_DAYS);
        List<Programme> expiredDrafts = programmeRepository.findByStatusInAndUpdatedAtBefore(
                List.of(
                        WorkflowStatus.DRAFT,
                        WorkflowStatus.PENDING_ADVISOR_APPROVAL,
                        WorkflowStatus.ADVISOR_APPROVED
                ),
                cutoff);
        if (!expiredDrafts.isEmpty()) {
            programmeRepository.deleteAll(expiredDrafts);
        }
    }

    @Transactional
    public void archiveExpiredDrafts() {
        // Pre-MPP drafts are purged directly; nothing to archive separately.
    }

    @Transactional
    public void deleteExpiredArchives() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        List<Programme> toDelete = programmeRepository
                .findByStatusAndArchivedAtBefore(WorkflowStatus.ARCHIVED, cutoff);
        programmeRepository.deleteAll(toDelete);
    }

    private void copyProgrammeFields(ProgrammeDraftRequest request, Programme programme) {
        programme.setTitle(request.getTitle());
        programme.setDescription(request.getDescription());
        programme.setCategory(request.getCategory());
        programme.setProgrammeLevel(request.getProgrammeLevel());
        programme.setProgrammeType(request.getProgrammeType());
        programme.setOrganizerClub(request.getOrganizerClub());
        programme.setObjectives(request.getObjectives());
        programme.setExpectedOutcomes(request.getExpectedOutcomes());
        programme.setVenue(request.getVenue());
        programme.setGoogleMapsLink(request.getGoogleMapsLink());
        programme.setCommunicationLink(request.getCommunicationLink());
        programme.setCustomRegistrationFieldsJson(serializeCustomFields(request.getCustomRegistrationFields()));
        programme.setStartDate(request.getStartDate());
        programme.setEndDate(request.getEndDate());
        programme.setStartTime(request.getStartTime());
        programme.setEndTime(request.getEndTime());
        programme.setExpectedParticipants(request.getExpectedParticipants());
        programme.setExpectedStudentParticipants(request.getExpectedStudentParticipants());
        programme.setExpectedStaffParticipants(request.getExpectedStaffParticipants());
        programme.setExpectedExternalParticipants(request.getExpectedExternalParticipants());
        programme.setRegistrationOpenDate(request.getRegistrationOpenDate());
        programme.setRegistrationCloseDate(request.getRegistrationCloseDate());
        programme.setCollaboratingOrganization(request.getCollaboratingOrganization());
        programme.setSponsorshipInfo(request.getSponsorshipInfo());
        programme.setIsPaid(request.getIsPaid());
        programme.setRegistrationFee(request.getRegistrationFee());
        programme.setPaymentInstructions(request.getPaymentInstructions());
        programme.setPaymentReferenceFormat(request.getPaymentReferenceFormat());
        programme.setIsTeamProgramme(request.getIsTeamProgramme());
        programme.setTeamNameRequired(request.getTeamNameRequired());
        programme.setMinTeamSize(request.getMinTeamSize());
        programme.setMaxTeamSize(request.getMaxTeamSize());
        if (request.getCertificateMode() != null && !request.getCertificateMode().isBlank()) {
            programme.setCertificateMode(request.getCertificateMode().trim().toUpperCase());
        } else if (programme.getCertificateMode() == null || programme.getCertificateMode().isBlank()) {
            programme.setCertificateMode("SYSTEM");
        }
        if (request.getCertificateTemplate() != null && !request.getCertificateTemplate().isBlank()) {
            programme.setCertificateTemplate(request.getCertificateTemplate().trim().toUpperCase());
        } else if (programme.getCertificateTemplate() == null || programme.getCertificateTemplate().isBlank()) {
            programme.setCertificateTemplate("GEOMETRIC_MODERN");
        }
        if (request.getCertificateOrientation() != null && !request.getCertificateOrientation().isBlank()) {
            programme.setCertificateOrientation(request.getCertificateOrientation().trim().toUpperCase());
        } else if (programme.getCertificateOrientation() == null || programme.getCertificateOrientation().isBlank()) {
            programme.setCertificateOrientation("PORTRAIT");
        }
    }

    private String serializeCustomFields(List<ProgrammeCustomFieldDto> fields) {
        if (fields == null || fields.isEmpty()) {
            return null;
        }
        try {
            List<ProgrammeCustomFieldDto> cleaned = new ArrayList<>();
            int index = 0;
            for (ProgrammeCustomFieldDto field : fields) {
                if (field == null || field.getLabel() == null || field.getLabel().isBlank()) {
                    continue;
                }
                ProgrammeCustomFieldDto normalized = new ProgrammeCustomFieldDto();
                normalized.setId(field.getId() != null && !field.getId().isBlank()
                        ? field.getId()
                        : "field-" + (++index));
                normalized.setLabel(field.getLabel().trim());
                normalized.setRequired(field.isRequired());
                normalized.setFieldType(field.getFieldType() != null ? field.getFieldType() : "TEXT");
                cleaned.add(normalized);
            }
            return cleaned.isEmpty() ? null : objectMapper.writeValueAsString(cleaned);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid custom registration fields.", ex);
        }
    }

    private void saveCommittee(Programme programme, List<CommitteeMemberDto> members) {
        committeeRepository.deleteByProgrammeId(programme.getId());
        if (members == null) return;

        for (CommitteeMemberDto member : members) {
            if (member.getMatricNumber() == null || member.getMatricNumber().isBlank()) continue;

            if (CommitteeRole.SPECIAL_CONTRIBUTION.equals(member.getCommitteeRole())
                    && (member.getContributionDescription() == null
                    || member.getContributionDescription().isBlank())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Contribution description is required for Special Contribution members.");
            }

            var lookup = studentLookupService.lookupByMatric(member.getMatricNumber());
            ProgrammeCommittee committee = new ProgrammeCommittee();
            committee.setProgramme(programme);
            committee.setMatricNumber(lookup.getMatricNumber());
            committee.setFullName(lookup.getFullName());
            committee.setFaculty(lookup.getFaculty());
            committee.setCommitteeRole(member.getCommitteeRole());
            committee.setPositionLabel(member.getPositionLabel());
            committee.setContributionDescription(member.getContributionDescription());
            committee.setMeritRoleType(CommitteeRole.meritRoleTypeFor(member.getCommitteeRole()));
            committee.setMeritPoints(meritRuleService.getMeritPoints(
                    programme.getProgrammeLevel(), committee.getMeritRoleType()));
            committee.setHasCampuslinkAccount(lookup.isHasCampusLinkAccount());
            if (lookup.getCampusLinkUserId() != null) {
                committee.setStudent(userRepository.findById(lookup.getCampusLinkUserId()).orElse(null));
            }
            committeeRepository.save(committee);
        }
    }

    private void saveSdgs(Programme programme, List<Integer> sdgNumbers) {
        Long programmeId = programme.getId();
        sdgRepository.deleteByProgrammeId(programmeId);
        if (sdgNumbers == null || sdgNumbers.isEmpty()) {
            return;
        }

        Set<Integer> uniqueSdgs = new LinkedHashSet<>();
        for (Integer sdg : sdgNumbers) {
            if (sdg != null) {
                uniqueSdgs.add(sdg);
            }
        }

        for (Integer sdg : uniqueSdgs) {
            ProgrammeSdg programmeSdg = new ProgrammeSdg();
            programmeSdg.setProgramme(programme);
            programmeSdg.setSdgNumber(sdg);
            sdgRepository.save(programmeSdg);
        }
    }

    private void saveAdvisor(Programme programme, AdvisorAssignRequest advisor) {
        if (advisor == null || advisor.getAdvisorName() == null || advisor.getAdvisorName().isBlank()) {
            return;
        }

        AdvisorApproval approval = advisorApprovalRepository.findByProgrammeId(programme.getId())
                .orElse(new AdvisorApproval());
        boolean alreadySigned = "APPROVED".equalsIgnoreCase(approval.getStatus());
        approval.setProgramme(programme);
        approval.setAdvisorName(advisor.getAdvisorName());
        approval.setAdvisorEmail(advisor.getAdvisorEmail());
        if (advisor.getApprovalMethod() != null && !advisor.getApprovalMethod().isBlank()) {
            approval.setApprovalMethod(advisor.getApprovalMethod());
        } else if (approval.getApprovalMethod() == null) {
            approval.setApprovalMethod("OFFLINE");
        }
        if (!alreadySigned) {
            approval.setStatus("ASSIGNED");
        }
        if (approval.getApprovalToken() == null) {
            approval.setApprovalToken(UUID.randomUUID().toString());
        }
        advisorApprovalRepository.save(approval);
    }

    private void saveBudgetLines(Programme programme, List<BudgetLineDto> lines) {
        budgetLineRepository.deleteByProgrammeId(programme.getId());
        if (lines == null || lines.isEmpty()) {
            return;
        }

        int index = 0;
        for (BudgetLineDto line : lines) {
            if (line == null || line.getCategory() == null || line.getCategory().isBlank()) {
                continue;
            }
            ProgrammeBudgetLine entity = new ProgrammeBudgetLine();
            entity.setProgramme(programme);
            entity.setLineType(line.getLineType());
            entity.setCategory(line.getCategory());
            entity.setAmount(line.getAmount() != null ? line.getAmount() : BigDecimal.ZERO);
            entity.setSortOrder(line.getSortOrder() != null ? line.getSortOrder() : index);
            budgetLineRepository.save(entity);
            index++;
        }
    }

    private void saveTentativeSchedule(Programme programme, List<TentativeItemDto> items) {
        tentativeRepository.deleteByProgrammeId(programme.getId());
        if (items == null || items.isEmpty()) {
            return;
        }

        int index = 0;
        for (TentativeItemDto item : items) {
            if (item == null) {
                continue;
            }
            boolean hasContent = (item.getTimeSlot() != null && !item.getTimeSlot().isBlank())
                    || (item.getActivity() != null && !item.getActivity().isBlank())
                    || (item.getPersonInCharge() != null && !item.getPersonInCharge().isBlank());
            if (!hasContent) {
                continue;
            }
            ProgrammeTentative entity = new ProgrammeTentative();
            entity.setProgramme(programme);
            entity.setTimeSlot(item.getTimeSlot() != null ? item.getTimeSlot().trim() : "");
            entity.setActivity(item.getActivity() != null ? item.getActivity().trim() : "");
            entity.setPersonInCharge(item.getPersonInCharge() != null ? item.getPersonInCharge().trim() : "");
            entity.setSortOrder(item.getSortOrder() != null ? item.getSortOrder() : index);
            tentativeRepository.save(entity);
            index++;
        }
    }

    private void saveSpeakers(Programme programme, List<SpeakerDto> speakers,
                              Map<Integer, MultipartFile> speakerCvByIndex) {
        speakerRepository.deleteByProgrammeId(programme.getId());
        if (speakers == null || speakers.isEmpty()) {
            return;
        }

        int savedCount = 0;
        for (int i = 0; i < speakers.size(); i++) {
            SpeakerDto speaker = speakers.get(i);
            if (speaker == null || speaker.getSpeakerName() == null || speaker.getSpeakerName().isBlank()) {
                continue;
            }

            ProgrammeSpeaker entity = new ProgrammeSpeaker();
            entity.setProgramme(programme);
            entity.setSpeakerName(speaker.getSpeakerName().trim());
            entity.setPosition(trimToNull(speaker.getPosition()));
            entity.setOrganization(trimToNull(speaker.getOrganization()));
            entity.setEmail(trimToNull(speaker.getEmail()));
            entity.setPhone(trimToNull(speaker.getPhone()));
            entity.setSortOrder(speaker.getSortOrder() != null ? speaker.getSortOrder() : savedCount);

            MultipartFile cvFile = speakerCvByIndex != null ? speakerCvByIndex.get(i) : null;
            if (cvFile != null && !cvFile.isEmpty()) {
                String path = fileStorageService.store(cvFile, "speaker-cvs");
                entity.setCvPath(path);
            } else if (speaker.getCvPath() != null && !speaker.getCvPath().isBlank()) {
                entity.setCvPath(speaker.getCvPath());
            }

            speakerRepository.save(entity);
            savedCount++;
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void saveDocument(Programme programme, String type, String path, String fileName) {
        documentRepository.findByProgrammeIdAndDocumentType(programme.getId(), type)
                .ifPresent(documentRepository::delete);

        ProgrammeDocument doc = new ProgrammeDocument();
        doc.setProgramme(programme);
        doc.setDocumentType(type);
        doc.setFilePath(path);
        doc.setFileName(fileName);
        documentRepository.save(doc);
    }

    private boolean hasDocument(Long programmeId, String type) {
        if (DocumentType.SUPPORTING.equals(type)) {
            return !documentRepository.findAllByProgrammeIdAndDocumentType(programmeId, type).isEmpty();
        }
        return documentRepository.findByProgrammeIdAndDocumentType(programmeId, type).isPresent();
    }

    private void assertOrganizerOwnsProgramme(Programme programme, Long organizerId) {
        if (programme.getOrganizer() == null || !organizerId.equals(programme.getOrganizer().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own programmes.");
        }
    }

    private List<MultipartFile> normalizeUploadedFiles(MultipartFile[] documents) {
        List<MultipartFile> uploadedFiles = new ArrayList<>();
        if (documents == null) {
            return uploadedFiles;
        }
        for (MultipartFile document : documents) {
            if (document != null && !document.isEmpty()) {
                uploadedFiles.add(document);
            }
        }
        return uploadedFiles;
    }

    private Programme getProgrammeOrThrow(Long id) {
        return programmeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme not found."));
    }

    private void recordHistory(Programme programme, String from, String to, String action,
                               Long performedBy, String remarks) {
        WorkflowHistory history = new WorkflowHistory();
        history.setProgramme(programme);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setAction(action);
        history.setPerformedBy(performedBy);
        history.setRemarks(remarks);
        workflowHistoryRepository.save(history);
    }

    private void normalizeProgrammeFileFields(Programme programme) {
        if (programme == null) {
            return;
        }
        programme.setPosterPath(FileUrlHelper.toPublicUrl(programme.getPosterPath()));
        programme.setPaymentQrPath(FileUrlHelper.toPublicUrl(programme.getPaymentQrPath()));
        programme.setAdvisorSignedFormPath(FileUrlHelper.toPublicUrl(programme.getAdvisorSignedFormPath()));
        programme.setAdvisorSignaturePath(FileUrlHelper.toPublicUrl(programme.getAdvisorSignaturePath()));
    }
}
