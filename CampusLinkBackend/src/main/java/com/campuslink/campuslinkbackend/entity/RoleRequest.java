package com.campuslink.campuslinkbackend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_request")
public class RoleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "requested_role", nullable = false)
    private String requestedRole;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "document_path")
    private String documentPath;

    @Column(name = "document_name")
    private String documentName;

    @Column(name = "documents_json", columnDefinition = "TEXT")
    private String documentsJson;

    @Column(name = "club_id")
    private Long clubId;

    @Column(name = "club_name")
    private String clubName;

    @Column(name = "hepa_signed_document_path")
    private String hepaSignedDocumentPath;

    @Column(name = "hepa_signed_document_name")
    private String hepaSignedDocumentName;

    @Column(nullable = false)
    private String status;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (status == null) status = "PENDING_HEPA_APPROVAL";
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getDocumentPath() { return documentPath; }
    public void setDocumentPath(String documentPath) { this.documentPath = documentPath; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getDocumentsJson() { return documentsJson; }
    public void setDocumentsJson(String documentsJson) { this.documentsJson = documentsJson; }
    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public String getHepaSignedDocumentPath() { return hepaSignedDocumentPath; }
    public void setHepaSignedDocumentPath(String hepaSignedDocumentPath) { this.hepaSignedDocumentPath = hepaSignedDocumentPath; }
    public String getHepaSignedDocumentName() { return hepaSignedDocumentName; }
    public void setHepaSignedDocumentName(String hepaSignedDocumentName) { this.hepaSignedDocumentName = hepaSignedDocumentName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
