package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDate;

public class CertificateRenderDto {
    private Long certificateId;
    private String studentName;
    private String matricNumber;
    private String programmeTitle;
    private String organizerClub;
    private String venue;
    private LocalDate eventDate;
    private LocalDate issueDate;
    private String advisorName;
    private String advisorSignatureUrl;
    private String certificateTemplate;
    private String certificateOrientation;

    public Long getCertificateId() { return certificateId; }
    public void setCertificateId(Long certificateId) { this.certificateId = certificateId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getMatricNumber() { return matricNumber; }
    public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
    public String getProgrammeTitle() { return programmeTitle; }
    public void setProgrammeTitle(String programmeTitle) { this.programmeTitle = programmeTitle; }
    public String getOrganizerClub() { return organizerClub; }
    public void setOrganizerClub(String organizerClub) { this.organizerClub = organizerClub; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }
    public String getAdvisorSignatureUrl() { return advisorSignatureUrl; }
    public void setAdvisorSignatureUrl(String advisorSignatureUrl) { this.advisorSignatureUrl = advisorSignatureUrl; }
    public String getCertificateTemplate() { return certificateTemplate; }
    public void setCertificateTemplate(String certificateTemplate) { this.certificateTemplate = certificateTemplate; }
    public String getCertificateOrientation() { return certificateOrientation; }
    public void setCertificateOrientation(String certificateOrientation) {
        this.certificateOrientation = certificateOrientation;
    }
}
