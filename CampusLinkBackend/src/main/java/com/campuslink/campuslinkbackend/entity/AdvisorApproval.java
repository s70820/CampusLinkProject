package com.campuslink.campuslinkbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "advisor_approval")
public class AdvisorApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id", nullable = false, unique = true)
    @JsonIgnore
    private Programme programme;

    @Column(name = "advisor_name", nullable = false)
    private String advisorName;

    @Column(name = "advisor_email")
    private String advisorEmail;

    @Column(name = "approval_method")
    private String approvalMethod;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "approval_token", unique = true)
    private String approvalToken;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "signed_document_path")
    private String signedDocumentPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }
    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }
    public String getAdvisorEmail() { return advisorEmail; }
    public void setAdvisorEmail(String advisorEmail) { this.advisorEmail = advisorEmail; }
    public String getApprovalMethod() { return approvalMethod; }
    public void setApprovalMethod(String approvalMethod) { this.approvalMethod = approvalMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getApprovalToken() { return approvalToken; }
    public void setApprovalToken(String approvalToken) { this.approvalToken = approvalToken; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getSignedDocumentPath() { return signedDocumentPath; }
    public void setSignedDocumentPath(String signedDocumentPath) { this.signedDocumentPath = signedDocumentPath; }
}
