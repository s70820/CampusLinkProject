package com.campuslink.campuslinkbackend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "programme_attendance")
public class ProgrammeAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "session_label", nullable = false)
    private String sessionLabel;

    @Column(name = "attendance_status", nullable = false)
    private String attendanceStatus;

    @Column(name = "checked_in_at", nullable = false)
    private LocalDateTime checkedInAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_session_id")
    private AttendanceSession attendanceSession;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSessionLabel() { return sessionLabel; }
    public void setSessionLabel(String sessionLabel) { this.sessionLabel = sessionLabel; }
    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }
    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }
    public AttendanceSession getAttendanceSession() { return attendanceSession; }
    public void setAttendanceSession(AttendanceSession attendanceSession) { this.attendanceSession = attendanceSession; }
}
