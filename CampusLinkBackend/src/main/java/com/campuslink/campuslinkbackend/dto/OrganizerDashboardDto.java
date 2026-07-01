package com.campuslink.campuslinkbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class OrganizerDashboardDto {
    private String fullName;
    private String clubName;
    private String faculty;
    private int totalProgrammes;
    private int pendingApproval;
    private int approvedProgrammes;
    private int draftProgrammes;
    private long totalParticipants;
    private long activeRegistrations;
    private double averageParticipantsPerProgramme;
    private List<OrganizerProgrammeSummaryDto> recentProgrammes = new ArrayList<>();

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public int getTotalProgrammes() { return totalProgrammes; }
    public void setTotalProgrammes(int totalProgrammes) { this.totalProgrammes = totalProgrammes; }
    public int getPendingApproval() { return pendingApproval; }
    public void setPendingApproval(int pendingApproval) { this.pendingApproval = pendingApproval; }
    public int getApprovedProgrammes() { return approvedProgrammes; }
    public void setApprovedProgrammes(int approvedProgrammes) { this.approvedProgrammes = approvedProgrammes; }
    public int getDraftProgrammes() { return draftProgrammes; }
    public void setDraftProgrammes(int draftProgrammes) { this.draftProgrammes = draftProgrammes; }
    public long getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(long totalParticipants) { this.totalParticipants = totalParticipants; }
    public long getActiveRegistrations() { return activeRegistrations; }
    public void setActiveRegistrations(long activeRegistrations) { this.activeRegistrations = activeRegistrations; }
    public double getAverageParticipantsPerProgramme() { return averageParticipantsPerProgramme; }
    public void setAverageParticipantsPerProgramme(double averageParticipantsPerProgramme) {
        this.averageParticipantsPerProgramme = averageParticipantsPerProgramme;
    }
    public List<OrganizerProgrammeSummaryDto> getRecentProgrammes() { return recentProgrammes; }
    public void setRecentProgrammes(List<OrganizerProgrammeSummaryDto> recentProgrammes) {
        this.recentProgrammes = recentProgrammes;
    }
}
