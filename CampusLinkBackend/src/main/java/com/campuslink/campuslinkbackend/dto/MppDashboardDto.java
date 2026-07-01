package com.campuslink.campuslinkbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class MppDashboardDto {
    private String fullName;
    private String faculty;
    private int pendingReview;
    private int mppApproved;
    private int mppRejected;
    private int forwardedToHepa;
    private int totalProgrammes;
    private List<WorkflowProgrammeSummaryDto> recentPending = new ArrayList<>();

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public int getPendingReview() { return pendingReview; }
    public void setPendingReview(int pendingReview) { this.pendingReview = pendingReview; }
    public int getMppApproved() { return mppApproved; }
    public void setMppApproved(int mppApproved) { this.mppApproved = mppApproved; }
    public int getMppRejected() { return mppRejected; }
    public void setMppRejected(int mppRejected) { this.mppRejected = mppRejected; }
    public int getForwardedToHepa() { return forwardedToHepa; }
    public void setForwardedToHepa(int forwardedToHepa) { this.forwardedToHepa = forwardedToHepa; }
    public int getTotalProgrammes() { return totalProgrammes; }
    public void setTotalProgrammes(int totalProgrammes) { this.totalProgrammes = totalProgrammes; }
    public List<WorkflowProgrammeSummaryDto> getRecentPending() { return recentPending; }
    public void setRecentPending(List<WorkflowProgrammeSummaryDto> recentPending) { this.recentPending = recentPending; }
}
