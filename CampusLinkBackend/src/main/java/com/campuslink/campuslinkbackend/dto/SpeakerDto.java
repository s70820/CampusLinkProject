package com.campuslink.campuslinkbackend.dto;

public class SpeakerDto {

    private String speakerName;
    private String position;
    private String organization;
    private String email;
    private String phone;
    private String cvPath;
    private Integer sortOrder;

    public String getSpeakerName() { return speakerName; }
    public void setSpeakerName(String speakerName) { this.speakerName = speakerName; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCvPath() { return cvPath; }
    public void setCvPath(String cvPath) { this.cvPath = cvPath; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
