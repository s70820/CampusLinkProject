package com.campuslink.campuslinkbackend.dto;

public class StudentLookupResponse {

    private String matricNumber;
    private String fullName;
    private String faculty;
    private boolean existsInRegistry;
    private boolean hasCampusLinkAccount;
    private Long campusLinkUserId;
    private String phoneNumber;
    private String warning;

    public String getMatricNumber() { return matricNumber; }
    public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public boolean isExistsInRegistry() { return existsInRegistry; }
    public void setExistsInRegistry(boolean existsInRegistry) { this.existsInRegistry = existsInRegistry; }
    public boolean isHasCampusLinkAccount() { return hasCampusLinkAccount; }
    public void setHasCampusLinkAccount(boolean hasCampusLinkAccount) { this.hasCampusLinkAccount = hasCampusLinkAccount; }
    public Long getCampusLinkUserId() { return campusLinkUserId; }
    public void setCampusLinkUserId(Long campusLinkUserId) { this.campusLinkUserId = campusLinkUserId; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getWarning() { return warning; }
    public void setWarning(String warning) { this.warning = warning; }
}
