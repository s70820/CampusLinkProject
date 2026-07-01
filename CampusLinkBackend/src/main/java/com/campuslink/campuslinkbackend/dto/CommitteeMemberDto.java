package com.campuslink.campuslinkbackend.dto;

public class CommitteeMemberDto {

    private String matricNumber;
    private String fullName;
    private String faculty;
    private String committeeRole;
    private String positionLabel;
    private String contributionDescription;

    public String getMatricNumber() { return matricNumber; }
    public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public String getCommitteeRole() { return committeeRole; }
    public void setCommitteeRole(String committeeRole) { this.committeeRole = committeeRole; }
    public String getPositionLabel() { return positionLabel; }
    public void setPositionLabel(String positionLabel) { this.positionLabel = positionLabel; }
    public String getContributionDescription() { return contributionDescription; }
    public void setContributionDescription(String contributionDescription) { this.contributionDescription = contributionDescription; }
}
