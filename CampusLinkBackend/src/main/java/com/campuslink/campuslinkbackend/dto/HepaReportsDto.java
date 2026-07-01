package com.campuslink.campuslinkbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class HepaReportsDto {
    private int totalProgrammes;
    private int approvedProgrammes;
    private int pendingHepaProgrammes;
    private int pendingMppProgrammes;
    private int rejectedProgrammes;
    private int totalRoleRequests;
    private int pendingRoleRequests;
    private int totalStudents;
    private int totalOrganizers;
    private int totalMpp;
    private List<CategoryCountDto> programmesByCategory = new ArrayList<>();
    private List<WorkflowProgrammeSummaryDto> recentApprovals = new ArrayList<>();

    public static class CategoryCountDto {
        private String category;
        private int count;

        public CategoryCountDto() {}

        public CategoryCountDto(String category, int count) {
            this.category = category;
            this.count = count;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public int getTotalProgrammes() { return totalProgrammes; }
    public void setTotalProgrammes(int totalProgrammes) { this.totalProgrammes = totalProgrammes; }
    public int getApprovedProgrammes() { return approvedProgrammes; }
    public void setApprovedProgrammes(int approvedProgrammes) { this.approvedProgrammes = approvedProgrammes; }
    public int getPendingHepaProgrammes() { return pendingHepaProgrammes; }
    public void setPendingHepaProgrammes(int pendingHepaProgrammes) { this.pendingHepaProgrammes = pendingHepaProgrammes; }
    public int getPendingMppProgrammes() { return pendingMppProgrammes; }
    public void setPendingMppProgrammes(int pendingMppProgrammes) { this.pendingMppProgrammes = pendingMppProgrammes; }
    public int getRejectedProgrammes() { return rejectedProgrammes; }
    public void setRejectedProgrammes(int rejectedProgrammes) { this.rejectedProgrammes = rejectedProgrammes; }
    public int getTotalRoleRequests() { return totalRoleRequests; }
    public void setTotalRoleRequests(int totalRoleRequests) { this.totalRoleRequests = totalRoleRequests; }
    public int getPendingRoleRequests() { return pendingRoleRequests; }
    public void setPendingRoleRequests(int pendingRoleRequests) { this.pendingRoleRequests = pendingRoleRequests; }
    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    public int getTotalOrganizers() { return totalOrganizers; }
    public void setTotalOrganizers(int totalOrganizers) { this.totalOrganizers = totalOrganizers; }
    public int getTotalMpp() { return totalMpp; }
    public void setTotalMpp(int totalMpp) { this.totalMpp = totalMpp; }
    public List<CategoryCountDto> getProgrammesByCategory() { return programmesByCategory; }
    public void setProgrammesByCategory(List<CategoryCountDto> programmesByCategory) { this.programmesByCategory = programmesByCategory; }
    public List<WorkflowProgrammeSummaryDto> getRecentApprovals() { return recentApprovals; }
    public void setRecentApprovals(List<WorkflowProgrammeSummaryDto> recentApprovals) { this.recentApprovals = recentApprovals; }
}
