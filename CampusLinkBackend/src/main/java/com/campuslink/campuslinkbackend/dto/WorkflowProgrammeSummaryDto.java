package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDate;

public class WorkflowProgrammeSummaryDto {
    private Long id;
    private String title;
    private String category;
    private String status;
    private String mppStatus;
    private String hepaStatus;
    private String mppRemarks;
    private LocalDate startDate;
    private LocalDate endDate;
    private String venue;
    private String organizerClub;
    private String organizerName;
    private Integer expectedParticipants;
    private Integer meritPoints;

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
    public String getMppRemarks() { return mppRemarks; }
    public void setMppRemarks(String mppRemarks) { this.mppRemarks = mppRemarks; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getOrganizerClub() { return organizerClub; }
    public void setOrganizerClub(String organizerClub) { this.organizerClub = organizerClub; }
    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
    public Integer getExpectedParticipants() { return expectedParticipants; }
    public void setExpectedParticipants(Integer expectedParticipants) { this.expectedParticipants = expectedParticipants; }
    public Integer getMeritPoints() { return meritPoints; }
    public void setMeritPoints(Integer meritPoints) { this.meritPoints = meritPoints; }
}
