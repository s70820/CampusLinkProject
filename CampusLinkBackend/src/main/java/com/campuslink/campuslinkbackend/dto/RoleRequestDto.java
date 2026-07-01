package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RoleRequestDto {
    private Long id;
    private Long userId;
    private String requesterName;
    private String requesterMatric;
    private String currentRole;
    private String requestedRole;
    private String reason;
    private String documentName;
    private String documentUrl;
    private String status;
    private String reviewNotes;
    private String reviewedByName;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private List<RoleRequestDocumentDto> documents = new ArrayList<>();
    private Long clubId;
    private String clubName;
    private String hepaSignedDocumentName;
    private String hepaSignedDocumentUrl;
    private String assignedRole;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
    public String getRequesterMatric() { return requesterMatric; }
    public void setRequesterMatric(String requesterMatric) { this.requesterMatric = requesterMatric; }
    public String getCurrentRole() { return currentRole; }
    public void setCurrentRole(String currentRole) { this.currentRole = currentRole; }
    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public String getReviewedByName() { return reviewedByName; }
    public void setReviewedByName(String reviewedByName) { this.reviewedByName = reviewedByName; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public List<RoleRequestDocumentDto> getDocuments() { return documents; }
    public void setDocuments(List<RoleRequestDocumentDto> documents) { this.documents = documents; }
    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public String getHepaSignedDocumentName() { return hepaSignedDocumentName; }
    public void setHepaSignedDocumentName(String hepaSignedDocumentName) { this.hepaSignedDocumentName = hepaSignedDocumentName; }
    public String getHepaSignedDocumentUrl() { return hepaSignedDocumentUrl; }
    public void setHepaSignedDocumentUrl(String hepaSignedDocumentUrl) { this.hepaSignedDocumentUrl = hepaSignedDocumentUrl; }
    public String getAssignedRole() { return assignedRole; }
    public void setAssignedRole(String assignedRole) { this.assignedRole = assignedRole; }
}
