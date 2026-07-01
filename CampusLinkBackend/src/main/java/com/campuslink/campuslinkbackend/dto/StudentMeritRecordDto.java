package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDate;

public class StudentMeritRecordDto {
    private Long id;
    private Long programmeId;
    private String programmeTitle;
    private String category;
    private String programmeLevel;
    private String startDate;
    private String endDate;
    private String meritRoleType;
    private String role;
    private int meritAwarded;
    private String academicYear;
    private String semester;
    private String status;
    private LocalDate awardedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }
    public String getProgrammeTitle() { return programmeTitle; }
    public void setProgrammeTitle(String programmeTitle) { this.programmeTitle = programmeTitle; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getProgrammeLevel() { return programmeLevel; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public void setProgrammeLevel(String programmeLevel) { this.programmeLevel = programmeLevel; }
    public String getMeritRoleType() { return meritRoleType; }
    public void setMeritRoleType(String meritRoleType) { this.meritRoleType = meritRoleType; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public int getMeritAwarded() { return meritAwarded; }
    public void setMeritAwarded(int meritAwarded) { this.meritAwarded = meritAwarded; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getAwardedAt() { return awardedAt; }
    public void setAwardedAt(LocalDate awardedAt) { this.awardedAt = awardedAt; }
}
