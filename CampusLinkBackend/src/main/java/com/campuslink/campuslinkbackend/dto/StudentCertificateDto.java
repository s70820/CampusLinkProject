package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDate;

public class StudentCertificateDto {
    private Long id;
    private Long programmeId;
    private String programmeTitle;
    private String organizerClub;
    private String certificateType;
    private LocalDate issuedAt;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }
    public String getProgrammeTitle() { return programmeTitle; }
    public void setProgrammeTitle(String programmeTitle) { this.programmeTitle = programmeTitle; }
    public String getOrganizerClub() { return organizerClub; }
    public void setOrganizerClub(String organizerClub) { this.organizerClub = organizerClub; }
    public String getCertificateType() { return certificateType; }
    public void setCertificateType(String certificateType) { this.certificateType = certificateType; }
    public LocalDate getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDate issuedAt) { this.issuedAt = issuedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
