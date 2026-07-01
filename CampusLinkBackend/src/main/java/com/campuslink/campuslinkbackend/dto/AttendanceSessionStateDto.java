package com.campuslink.campuslinkbackend.dto;

public class AttendanceSessionStateDto {
    private Long sessionId;
    private Long programmeId;
    private String programmeTitle;
    private String status;
    private String sessionLabel;
    private String token;
    private String qrPayload;
    private int countdownSeconds;
    private long checkedInCount;

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }
    public String getProgrammeTitle() { return programmeTitle; }
    public void setProgrammeTitle(String programmeTitle) { this.programmeTitle = programmeTitle; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSessionLabel() { return sessionLabel; }
    public void setSessionLabel(String sessionLabel) { this.sessionLabel = sessionLabel; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getQrPayload() { return qrPayload; }
    public void setQrPayload(String qrPayload) { this.qrPayload = qrPayload; }
    public int getCountdownSeconds() { return countdownSeconds; }
    public void setCountdownSeconds(int countdownSeconds) { this.countdownSeconds = countdownSeconds; }
    public long getCheckedInCount() { return checkedInCount; }
    public void setCheckedInCount(long checkedInCount) { this.checkedInCount = checkedInCount; }
}
