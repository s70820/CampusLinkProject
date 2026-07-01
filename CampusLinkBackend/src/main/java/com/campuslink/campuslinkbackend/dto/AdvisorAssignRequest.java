package com.campuslink.campuslinkbackend.dto;

public class AdvisorAssignRequest {

    private String advisorName;
    private String advisorEmail;
    private String approvalMethod;

    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }
    public String getAdvisorEmail() { return advisorEmail; }
    public void setAdvisorEmail(String advisorEmail) { this.advisorEmail = advisorEmail; }
    public String getApprovalMethod() { return approvalMethod; }
    public void setApprovalMethod(String approvalMethod) { this.approvalMethod = approvalMethod; }
}
