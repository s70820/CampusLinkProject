package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class RegistrationResponseDto {
    private Long id;
    private Long programmeId;
    private String programmeTitle;
    private String programmeCategory;
    private String status;
    private String registrationType;
    private String paymentReference;
    private String teamName;
    private Long teamRegistrationId;
    private LocalDateTime registeredAt;
    private String paymentReceiptUrl;
    private String paymentVerificationStatus;
    private String studentFullName;
    private String matricNumber;
    private String faculty;
    private String communicationLink;
    private Map<String, String> customFieldResponses;
    private List<ProgrammeCustomFieldDto> customRegistrationFields = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }
    public String getProgrammeTitle() { return programmeTitle; }
    public void setProgrammeTitle(String programmeTitle) { this.programmeTitle = programmeTitle; }
    public String getProgrammeCategory() { return programmeCategory; }
    public void setProgrammeCategory(String programmeCategory) { this.programmeCategory = programmeCategory; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRegistrationType() { return registrationType; }
    public void setRegistrationType(String registrationType) { this.registrationType = registrationType; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public Long getTeamRegistrationId() { return teamRegistrationId; }
    public void setTeamRegistrationId(Long teamRegistrationId) { this.teamRegistrationId = teamRegistrationId; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
    public String getPaymentReceiptUrl() { return paymentReceiptUrl; }
    public void setPaymentReceiptUrl(String paymentReceiptUrl) { this.paymentReceiptUrl = paymentReceiptUrl; }
    public String getPaymentVerificationStatus() { return paymentVerificationStatus; }
    public void setPaymentVerificationStatus(String paymentVerificationStatus) { this.paymentVerificationStatus = paymentVerificationStatus; }
    public String getStudentFullName() { return studentFullName; }
    public void setStudentFullName(String studentFullName) { this.studentFullName = studentFullName; }
    public String getMatricNumber() { return matricNumber; }
    public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public String getCommunicationLink() { return communicationLink; }
    public void setCommunicationLink(String communicationLink) { this.communicationLink = communicationLink; }
    public Map<String, String> getCustomFieldResponses() { return customFieldResponses; }
    public void setCustomFieldResponses(Map<String, String> customFieldResponses) { this.customFieldResponses = customFieldResponses; }
    public List<ProgrammeCustomFieldDto> getCustomRegistrationFields() { return customRegistrationFields; }
    public void setCustomRegistrationFields(List<ProgrammeCustomFieldDto> customRegistrationFields) {
        this.customRegistrationFields = customRegistrationFields;
    }
}
