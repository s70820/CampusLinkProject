package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDateTime;

public class StudentAttendanceDto {
    private Long id;
    private Long programmeId;
    private String programmeTitle;
    private String sessionLabel;
    private String attendanceStatus;
    private LocalDateTime checkedInAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }
    public String getProgrammeTitle() { return programmeTitle; }
    public void setProgrammeTitle(String programmeTitle) { this.programmeTitle = programmeTitle; }
    public String getSessionLabel() { return sessionLabel; }
    public void setSessionLabel(String sessionLabel) { this.sessionLabel = sessionLabel; }
    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }
    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }
}
