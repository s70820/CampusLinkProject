package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDateTime;

public class RoleRequestSummaryDto {
    private Long id;
    private String requesterName;
    private String requesterMatric;
    private String requestedRole;
    private String reason;
    private String status;
    private LocalDateTime submittedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
    public String getRequesterMatric() { return requesterMatric; }
    public void setRequesterMatric(String requesterMatric) { this.requesterMatric = requesterMatric; }
    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
