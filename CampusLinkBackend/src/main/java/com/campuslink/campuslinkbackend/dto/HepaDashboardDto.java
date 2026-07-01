package com.campuslink.campuslinkbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class HepaDashboardDto {
    private String fullName;
    private int pendingProgrammeApproval;
    private int approvedProgrammes;
    private int rejectedProgrammes;
    private int pendingRoleRequests;
    private int approvedRoleRequests;
    private int rejectedRoleRequests;
    private int totalStudents;
    private int totalOrganizers;
    private List<WorkflowProgrammeSummaryDto> recentPendingProgrammes = new ArrayList<>();
    private List<RoleRequestSummaryDto> recentRoleRequests = new ArrayList<>();

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public int getPendingProgrammeApproval() { return pendingProgrammeApproval; }
    public void setPendingProgrammeApproval(int pendingProgrammeApproval) { this.pendingProgrammeApproval = pendingProgrammeApproval; }
    public int getApprovedProgrammes() { return approvedProgrammes; }
    public void setApprovedProgrammes(int approvedProgrammes) { this.approvedProgrammes = approvedProgrammes; }
    public int getRejectedProgrammes() { return rejectedProgrammes; }
    public void setRejectedProgrammes(int rejectedProgrammes) { this.rejectedProgrammes = rejectedProgrammes; }
    public int getPendingRoleRequests() { return pendingRoleRequests; }
    public void setPendingRoleRequests(int pendingRoleRequests) { this.pendingRoleRequests = pendingRoleRequests; }
    public int getApprovedRoleRequests() { return approvedRoleRequests; }
    public void setApprovedRoleRequests(int approvedRoleRequests) { this.approvedRoleRequests = approvedRoleRequests; }
    public int getRejectedRoleRequests() { return rejectedRoleRequests; }
    public void setRejectedRoleRequests(int rejectedRoleRequests) { this.rejectedRoleRequests = rejectedRoleRequests; }
    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    public int getTotalOrganizers() { return totalOrganizers; }
    public void setTotalOrganizers(int totalOrganizers) { this.totalOrganizers = totalOrganizers; }
    public List<WorkflowProgrammeSummaryDto> getRecentPendingProgrammes() { return recentPendingProgrammes; }
    public void setRecentPendingProgrammes(List<WorkflowProgrammeSummaryDto> recentPendingProgrammes) {
        this.recentPendingProgrammes = recentPendingProgrammes;
    }
    public List<RoleRequestSummaryDto> getRecentRoleRequests() { return recentRoleRequests; }
    public void setRecentRoleRequests(List<RoleRequestSummaryDto> recentRoleRequests) {
        this.recentRoleRequests = recentRoleRequests;
    }
}
