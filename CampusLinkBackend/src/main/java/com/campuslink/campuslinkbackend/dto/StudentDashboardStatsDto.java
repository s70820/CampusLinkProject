package com.campuslink.campuslinkbackend.dto;

public class StudentDashboardStatsDto {
    private int meritPoints;
    private int programsJoined;
    private int completedPrograms;
    private int pendingApprovals;
    private int sessionsAttended;
    private int certificatesReady;
    private String attendanceRate;

    public int getMeritPoints() { return meritPoints; }
    public void setMeritPoints(int meritPoints) { this.meritPoints = meritPoints; }
    public int getProgramsJoined() { return programsJoined; }
    public void setProgramsJoined(int programsJoined) { this.programsJoined = programsJoined; }
    public int getCompletedPrograms() { return completedPrograms; }
    public void setCompletedPrograms(int completedPrograms) { this.completedPrograms = completedPrograms; }
    public int getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(int pendingApprovals) { this.pendingApprovals = pendingApprovals; }
    public int getSessionsAttended() { return sessionsAttended; }
    public void setSessionsAttended(int sessionsAttended) { this.sessionsAttended = sessionsAttended; }
    public int getCertificatesReady() { return certificatesReady; }
    public void setCertificatesReady(int certificatesReady) { this.certificatesReady = certificatesReady; }
    public String getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(String attendanceRate) { this.attendanceRate = attendanceRate; }
}
