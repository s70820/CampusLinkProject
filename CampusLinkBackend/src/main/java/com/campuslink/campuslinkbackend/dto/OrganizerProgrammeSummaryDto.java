package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class OrganizerProgrammeSummaryDto {
    private Long id;
    private String title;
    private String category;
    private String status;
    private String mppStatus;
    private String hepaStatus;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer expectedParticipants;
    private long participantCount;
    private String organizerClub;
    private Integer meritPoints;
    private String certificateMode;
    private String certificateTemplate;
    private String certificateOrientation;
    private String venue;
    private String advisorName;
    private String advisorSignatureUrl;
    private LocalDateTime updatedAt;
    private LocalDateTime draftExpiresAt;
    private Integer draftDaysRemaining;
    private Boolean draftExpiringSoon;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMppStatus() { return mppStatus; }
    public void setMppStatus(String mppStatus) { this.mppStatus = mppStatus; }
    public String getHepaStatus() { return hepaStatus; }
    public void setHepaStatus(String hepaStatus) { this.hepaStatus = hepaStatus; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getExpectedParticipants() { return expectedParticipants; }
    public void setExpectedParticipants(Integer expectedParticipants) { this.expectedParticipants = expectedParticipants; }
    public long getParticipantCount() { return participantCount; }
    public void setParticipantCount(long participantCount) { this.participantCount = participantCount; }
    public String getOrganizerClub() { return organizerClub; }
    public void setOrganizerClub(String organizerClub) { this.organizerClub = organizerClub; }
    public Integer getMeritPoints() { return meritPoints; }
    public void setMeritPoints(Integer meritPoints) { this.meritPoints = meritPoints; }
    public String getCertificateMode() { return certificateMode; }
    public void setCertificateMode(String certificateMode) { this.certificateMode = certificateMode; }
    public String getCertificateTemplate() { return certificateTemplate; }
    public void setCertificateTemplate(String certificateTemplate) { this.certificateTemplate = certificateTemplate; }
    public String getCertificateOrientation() { return certificateOrientation; }
    public void setCertificateOrientation(String certificateOrientation) {
        this.certificateOrientation = certificateOrientation;
    }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }
    public String getAdvisorSignatureUrl() { return advisorSignatureUrl; }
    public void setAdvisorSignatureUrl(String advisorSignatureUrl) { this.advisorSignatureUrl = advisorSignatureUrl; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getDraftExpiresAt() { return draftExpiresAt; }
    public void setDraftExpiresAt(LocalDateTime draftExpiresAt) { this.draftExpiresAt = draftExpiresAt; }
    public Integer getDraftDaysRemaining() { return draftDaysRemaining; }
    public void setDraftDaysRemaining(Integer draftDaysRemaining) { this.draftDaysRemaining = draftDaysRemaining; }
    public Boolean getDraftExpiringSoon() { return draftExpiringSoon; }
    public void setDraftExpiringSoon(Boolean draftExpiringSoon) { this.draftExpiringSoon = draftExpiringSoon; }
}
