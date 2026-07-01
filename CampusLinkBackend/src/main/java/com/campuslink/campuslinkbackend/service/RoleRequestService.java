package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.dto.RoleRequestDocumentDto;
import com.campuslink.campuslinkbackend.dto.RoleRequestDto;
import com.campuslink.campuslinkbackend.entity.RoleRequest;
import com.campuslink.campuslinkbackend.entity.RoleRequestHistory;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.RoleRequestHistoryRepository;
import com.campuslink.campuslinkbackend.repository.RoleRequestRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.util.ClubAdvisorDefaults;
import com.campuslink.campuslinkbackend.util.ClubOrganizerFormPdfWriter;
import com.campuslink.campuslinkbackend.util.FileUrlHelper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class RoleRequestService {

    public static final String STATUS_PENDING = "PENDING_HEPA_APPROVAL";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_REVOKED = "REVOKED";
    private static final int MPP_MAX_DOCUMENTS = 3;
    private static final String SHARED_ORGANIZER_TEMPLATE = "umt-club-organizer-approval-form.pdf";

    private final RoleRequestRepository roleRequestRepository;
    private final RoleRequestHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;
    private final ClubSecretaryService clubSecretaryService;
    private final ProgrammeRepository programmeRepository;

    public RoleRequestService(
            RoleRequestRepository roleRequestRepository,
            RoleRequestHistoryRepository historyRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService,
            ObjectMapper objectMapper,
            ClubSecretaryService clubSecretaryService,
            ProgrammeRepository programmeRepository) {
        this.roleRequestRepository = roleRequestRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.objectMapper = objectMapper;
        this.clubSecretaryService = clubSecretaryService;
        this.programmeRepository = programmeRepository;
    }

    @Transactional
    public RoleRequestDto submitRequest(Long userId, String requestedRole, String reason, String clubName,
                                        MultipartFile[] documents) {
        User user = requireUser(userId);
        String normalizedRole = normalizeRequestedRole(requestedRole);
        List<MultipartFile> uploadedFiles = normalizeUploadedFiles(documents);

        if (!"STUDENT".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only students can submit role upgrade requests.");
        }

        clubSecretaryService.assertUserEligibleForSecretary(user);

        if (roleRequestRepository.existsByUserIdAndStatus(userId, STATUS_PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You already have a pending role request under HEPA review.");
        }

        if (uploadedFiles.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one supporting document is required.");
        }

        if ("ORGANIZER".equals(normalizedRole) && uploadedFiles.size() != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Club secretary requests require exactly one signed UMT Club Organizer Approval Form.");
        }

        if ("ORGANIZER".equals(normalizedRole)) {
            String normalizedClubName = ClubSecretaryService.normalizeClubName(clubName);
            if (normalizedClubName == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Please enter the official club name you are applying to represent.");
            }
            clubSecretaryService.assertClubNameAvailableForSecretary(normalizedClubName);
            clubName = normalizedClubName;
        }

        if ("MPP".equals(normalizedRole) && uploadedFiles.size() > MPP_MAX_DOCUMENTS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "MPP requests can include up to " + MPP_MAX_DOCUMENTS + " supporting documents.");
        }

        List<StoredDocument> storedDocuments = new ArrayList<>();
        for (MultipartFile file : uploadedFiles) {
            String storedPath = fileStorageService.store(file, "role-requests");
            storedDocuments.add(new StoredDocument(storedPath, file.getOriginalFilename()));
        }

        RoleRequest request = new RoleRequest();
        request.setUser(user);
        request.setRequestedRole(normalizedRole);
        request.setReason(reason);
        request.setDocumentPath(storedDocuments.get(0).path);
        request.setDocumentName(storedDocuments.get(0).name);
        request.setDocumentsJson(writeDocumentsJson(storedDocuments));
        request.setClubName("ORGANIZER".equals(normalizedRole) ? clubName : null);
        request.setClubId(null);
        request.setStatus(STATUS_PENDING);
        roleRequestRepository.save(request);

        recordHistory(request, null, STATUS_PENDING, "SUBMITTED", user,
                "Role request submitted for HEPA review.");

        return toDto(request);
    }

    public List<RoleRequestDto> getMyRequests(Long userId) {
        requireUser(userId);
        return roleRequestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public byte[] buildClubOrganizerFormTemplate(Long userId, String clubName) {
        User user = requireUser(userId);
        return buildClubOrganizerFormForUser(user, clubName, LocalDateTime.now(), false);
    }

    public byte[] buildClubOrganizerFormForRequest(Long requestId, Long viewerUserId) {
        RoleRequest request = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role request not found."));
        User viewer = requireUser(viewerUserId);
        assertCanViewRoleRequestDocuments(viewer, request);
        if (!"ORGANIZER".equalsIgnoreCase(normalizeRequestedRole(request.getRequestedRole()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This request is not a club secretary application.");
        }
        boolean advisorSigned = STATUS_APPROVED.equals(request.getStatus());
        return buildClubOrganizerFormForUser(
                request.getUser(),
                request.getClubName(),
                request.getCreatedAt(),
                advisorSigned);
    }

    public List<RoleRequestDto> getAllRequests() {
        return roleRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<RoleRequestDto> getRequestsByStatus(String status) {
        String normalized = normalizeStatusFilter(status);
        return roleRequestRepository.findByStatusOrderByCreatedAtDesc(normalized).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoleRequestDto approveRequest(Long requestId, Long reviewerId, String reviewNotes,
                                         MultipartFile hepaSignedDocument) {
        User reviewer = requireUser(reviewerId);
        requireHepa(reviewer);

        RoleRequest request = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role request not found."));

        if (!STATUS_PENDING.equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending requests can be approved.");
        }

        User requester = userRepository.findById(request.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Applicant account not found."));
        assertRequesterEligibleForUpgrade(requester);
        String previousStatus = request.getStatus();
        String assignedRole = normalizeRequestedRole(request.getRequestedRole());

        if ("ORGANIZER".equals(assignedRole)
                && hepaSignedDocument != null
                && !hepaSignedDocument.isEmpty()) {
            String storedPath = fileStorageService.store(hepaSignedDocument, "role-requests/hepa-signed");
            request.setHepaSignedDocumentPath(storedPath);
            request.setHepaSignedDocumentName(hepaSignedDocument.getOriginalFilename());
        }

        request.setStatus(STATUS_APPROVED);
        request.setReviewNotes(reviewNotes);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        roleRequestRepository.save(request);

        activateApprovedRole(request, requester);

        recordHistory(request, previousStatus, STATUS_APPROVED, "APPROVED", reviewer,
                reviewNotes != null && !reviewNotes.isBlank()
                        ? reviewNotes
                        : "HEPA approved the role request. Assigned role: " + assignedRole + ".");

        RoleRequestDto dto = toDto(request);
        dto.setAssignedRole(assignedRole);
        return dto;
    }

    /**
     * Ensures a student account reflects an approved role request (repairs stale state on login/profile fetch).
     */
    @Transactional
    public User syncUserRoleFromApprovals(User user) {
        if (user == null || user.getId() == null) {
            return user;
        }
        if (!"STUDENT".equalsIgnoreCase(user.getRole() != null ? user.getRole() : "")) {
            return user;
        }
        return roleRequestRepository
                .findFirstByUserIdAndStatusOrderByReviewedAtDesc(user.getId(), STATUS_APPROVED)
                .map(request -> {
                    activateApprovedRole(request, user);
                    return userRepository.findById(user.getId()).orElse(user);
                })
                .orElse(user);
    }

    private void activateApprovedRole(RoleRequest request, User requester) {
        String assignedRole = normalizeRequestedRole(request.getRequestedRole());
        if ("ORGANIZER".equals(assignedRole)) {
            if (request.getClubName() == null || request.getClubName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "This secretary request is missing a club name.");
            }
            clubSecretaryService.assignSecretary(requester, request.getClubName(), request.getId());
        } else if ("MPP".equals(assignedRole)) {
            requester.setRole("MPP");
            requester.setApprovalStatus("APPROVED");
            requester.setClubId(null);
            requester.setClubName(null);
            userRepository.saveAndFlush(requester);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported requested role.");
        }
    }

    @Transactional
    public RoleRequestDto rejectRequest(Long requestId, Long reviewerId, String reviewNotes) {
        User reviewer = requireUser(reviewerId);
        requireHepa(reviewer);

        RoleRequest request = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role request not found."));

        if (!STATUS_PENDING.equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending requests can be rejected.");
        }

        if (reviewNotes == null || reviewNotes.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review notes are required when rejecting.");
        }

        String previousStatus = request.getStatus();
        request.setStatus(STATUS_REJECTED);
        request.setReviewNotes(reviewNotes);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        roleRequestRepository.save(request);

        recordHistory(request, previousStatus, STATUS_REJECTED, "REJECTED", reviewer, reviewNotes);

        return toDto(request);
    }

    @Transactional
    public RoleRequestDto revokeApprovedRequest(Long requestId, Long reviewerId, String reviewNotes) {
        User reviewer = requireUser(reviewerId);
        requireHepa(reviewer);

        if (reviewNotes == null || reviewNotes.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Revocation reason is required when removing an approved role.");
        }

        RoleRequest request = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role request not found."));

        if (!STATUS_APPROVED.equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only approved role requests can be revoked.");
        }

        User requester = userRepository.findById(request.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Applicant account not found."));

        String assignedRole = normalizeRequestedRole(request.getRequestedRole());
        demoteUserFromRole(requester, assignedRole);
        markRequestRevoked(request, reviewer, reviewNotes.trim());

        RoleRequestDto dto = toDto(request);
        dto.setAssignedRole(assignedRole);
        return dto;
    }

    @Transactional
    public RoleRequestDto revokeUserRole(Long userId, Long reviewerId, String reviewNotes) {
        User reviewer = requireUser(reviewerId);
        requireHepa(reviewer);

        if (reviewNotes == null || reviewNotes.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Revocation reason is required when removing a role.");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (reviewer.getId().equals(target.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot revoke your own account.");
        }

        String currentRole = target.getRole() != null ? target.getRole().toUpperCase(Locale.ROOT) : "";
        if (!"MPP".equals(currentRole) && !"ORGANIZER".equals(currentRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only MPP and organizer accounts can be revoked to student.");
        }

        RoleRequest linkedRequest = roleRequestRepository
                .findFirstByUserIdAndRequestedRoleIgnoreCaseAndStatusOrderByReviewedAtDesc(
                        userId, currentRole, STATUS_APPROVED)
                .orElse(null);

        demoteUserFromRole(target, currentRole);

        if (linkedRequest != null) {
            markRequestRevoked(linkedRequest, reviewer, reviewNotes.trim());
            RoleRequestDto dto = toDto(linkedRequest);
            dto.setAssignedRole(currentRole);
            return dto;
        }

        RoleRequestDto dto = new RoleRequestDto();
        dto.setUserId(target.getId());
        dto.setRequesterName(target.getFullName());
        dto.setRequesterMatric(target.getMatricNumber());
        dto.setCurrentRole("STUDENT");
        dto.setRequestedRole(currentRole);
        dto.setStatus(STATUS_REVOKED);
        dto.setReviewNotes(reviewNotes.trim());
        dto.setAssignedRole(currentRole);
        return dto;
    }

    private void demoteUserFromRole(User user, String role) {
        if ("ORGANIZER".equalsIgnoreCase(role)) {
            long programmeCount = programmeRepository.countByOrganizer_Id(user.getId());
            if (programmeCount > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This organizer has " + programmeCount
                                + " programme(s) on record. Reassign or archive them before revoking the secretary role.");
            }
            clubSecretaryService.releaseSecretary(user);
            return;
        }
        if ("MPP".equalsIgnoreCase(role)) {
            if (!"MPP".equalsIgnoreCase(user.getRole())) {
                return;
            }
            user.setRole("STUDENT");
            user.setApprovalStatus("APPROVED");
            user.setClubId(null);
            user.setClubName(null);
            userRepository.save(user);
            return;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role for revocation.");
    }

    private void markRequestRevoked(RoleRequest request, User reviewer, String reviewNotes) {
        String previousStatus = request.getStatus();
        request.setStatus(STATUS_REVOKED);
        request.setReviewNotes(reviewNotes);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        roleRequestRepository.save(request);

        recordHistory(request, previousStatus, STATUS_REVOKED, "REVOKED", reviewer, reviewNotes);
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

    private String writeDocumentsJson(List<StoredDocument> storedDocuments) {
        try {
            return objectMapper.writeValueAsString(storedDocuments);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store uploaded document metadata.", ex);
        }
    }

    private List<RoleRequestDocumentDto> readDocuments(RoleRequest request) {
        if (request.getDocumentsJson() != null && !request.getDocumentsJson().isBlank()) {
            try {
                List<StoredDocument> storedDocuments = objectMapper.readValue(
                        request.getDocumentsJson(),
                        new TypeReference<List<StoredDocument>>() {});
                return storedDocuments.stream()
                        .map(doc -> new RoleRequestDocumentDto(
                                doc.name,
                                resolveDocumentUrl(request, doc.path)))
                        .collect(Collectors.toList());
            } catch (Exception ex) {
                // Fall through to legacy single-document fields.
            }
        }

        if (request.getDocumentPath() != null) {
            List<RoleRequestDocumentDto> legacy = new ArrayList<>();
            legacy.add(new RoleRequestDocumentDto(
                    request.getDocumentName(),
                    resolveDocumentUrl(request, request.getDocumentPath())));
            return legacy;
        }

        return new ArrayList<>();
    }

    private String resolveDocumentUrl(RoleRequest request, String path) {
        if (isSharedOrganizerTemplate(request, path)) {
            return "/api/role-requests/" + request.getId() + "/club-organizer-form";
        }
        return FileUrlHelper.toPublicUrl(path);
    }

    private boolean isSharedOrganizerTemplate(RoleRequest request, String path) {
        return "ORGANIZER".equalsIgnoreCase(normalizeRequestedRole(request.getRequestedRole()))
                && path != null
                && path.toLowerCase(Locale.ROOT).contains(SHARED_ORGANIZER_TEMPLATE);
    }

    private void assertCanViewRoleRequestDocuments(User viewer, RoleRequest request) {
        if (request.getUser() != null && request.getUser().getId().equals(viewer.getId())) {
            return;
        }
        if ("HEPA".equalsIgnoreCase(viewer.getRole())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot view documents for this role request.");
    }

    private byte[] buildClubOrganizerFormForUser(
            User requester,
            String clubName,
            LocalDateTime submittedAt,
            boolean advisorSigned) {
        ClubAdvisorDefaults.Advisor advisor = ClubAdvisorDefaults.forOrganizerClub(clubName);
        String date = submittedAt != null
                ? submittedAt.format(java.time.format.DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))
                : "";
        return ClubOrganizerFormPdfWriter.build(
                nullSafe(requester.getFullName()),
                nullSafe(requester.getMatricNumber()),
                nullSafe(ClubSecretaryService.normalizeClubName(clubName)),
                "Setiausaha / Secretary",
                advisorSigned ? advisor.name() : "",
                advisorSigned ? advisor.position() : "",
                advisorSigned ? date : "");
    }

    private static String nullSafe(String value) {
        return value != null ? value : "";
    }

    private void recordHistory(RoleRequest request, String fromStatus, String toStatus,
                               String action, User performedBy, String remarks) {
        RoleRequestHistory history = new RoleRequestHistory();
        history.setRoleRequest(request);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setAction(action);
        history.setPerformedBy(performedBy);
        history.setRemarks(remarks);
        historyRepository.save(history);
    }

    private RoleRequestDto toDto(RoleRequest request) {
        User user = request.getUser();
        User reviewer = request.getReviewedBy();
        List<RoleRequestDocumentDto> documents = readDocuments(request);

        RoleRequestDto dto = new RoleRequestDto();
        dto.setId(request.getId());
        dto.setUserId(user.getId());
        dto.setRequesterName(user.getFullName());
        dto.setRequesterMatric(user.getMatricNumber());
        dto.setCurrentRole(user.getRole());
        dto.setRequestedRole(request.getRequestedRole());
        dto.setReason(request.getReason());
        dto.setDocuments(documents);
        if (!documents.isEmpty()) {
            dto.setDocumentName(documents.get(0).getName());
            dto.setDocumentUrl(documents.get(0).getUrl());
        }
        dto.setStatus(request.getStatus());
        dto.setClubId(request.getClubId());
        dto.setClubName(request.getClubName());
        if (request.getHepaSignedDocumentPath() != null) {
            dto.setHepaSignedDocumentName(request.getHepaSignedDocumentName());
            dto.setHepaSignedDocumentUrl(FileUrlHelper.toPublicUrl(request.getHepaSignedDocumentPath()));
        }
        dto.setReviewNotes(request.getReviewNotes());
        dto.setReviewedByName(reviewer != null ? reviewer.getFullName() : null);
        dto.setSubmittedAt(request.getCreatedAt());
        dto.setReviewedAt(request.getReviewedAt());
        return dto;
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private void requireHepa(User user) {
        if (!"HEPA".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only HEPA administrators can review role requests.");
        }
    }

    private void assertRequesterEligibleForUpgrade(User requester) {
        if (requester == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role request is missing an applicant.");
        }
        if (!"STUDENT".equalsIgnoreCase(requester.getRole())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This account already has the " + requester.getRole()
                            + " role. Reject this stale request instead of approving it.");
        }
    }

    private String normalizeRequestedRole(String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested role is required.");
        }
        String normalized = requestedRole.trim().toUpperCase(Locale.ROOT);
        if ("ORGANIZER".equals(normalized) || "MPP".equals(normalized)) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested role must be ORGANIZER or MPP.");
    }

    private String normalizeStatusFilter(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }
        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if ("PENDING".equals(normalized)) {
            return STATUS_PENDING;
        }
        if (STATUS_PENDING.equals(normalized) || STATUS_APPROVED.equals(normalized)
                || STATUS_REJECTED.equals(normalized) || STATUS_REVOKED.equals(normalized)) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status filter.");
    }

    private static class StoredDocument {
        public String path;
        public String name;

        public StoredDocument() {}

        public StoredDocument(String path, String name) {
            this.path = path;
            this.name = name;
        }

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
