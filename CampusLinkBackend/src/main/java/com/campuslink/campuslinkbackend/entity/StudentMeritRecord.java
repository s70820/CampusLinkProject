package com.campuslink.campuslinkbackend.entity;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_merit_record")
public class StudentMeritRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "programme_title", nullable = false)
    private String programmeTitle;

    @Column(name = "programme_level", nullable = false)
    private String programmeLevel;

    @Column(name = "merit_role_type", nullable = false)
    private String meritRoleType;

    @Column(name = "role_label", nullable = false)
    private String roleLabel;

    @Column(name = "merit_points", nullable = false)
    private Integer meritPoints;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private String status;

    @Column(name = "awarded_at", nullable = false)
    private LocalDate awardedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }
    public String getProgrammeTitle() { return programmeTitle; }
    public void setProgrammeTitle(String programmeTitle) { this.programmeTitle = programmeTitle; }
    public String getProgrammeLevel() { return programmeLevel; }
    public void setProgrammeLevel(String programmeLevel) { this.programmeLevel = programmeLevel; }
    public String getMeritRoleType() { return meritRoleType; }
    public void setMeritRoleType(String meritRoleType) { this.meritRoleType = meritRoleType; }
    public String getRoleLabel() { return roleLabel; }
    public void setRoleLabel(String roleLabel) { this.roleLabel = roleLabel; }
    public Integer getMeritPoints() { return meritPoints; }
    public void setMeritPoints(Integer meritPoints) { this.meritPoints = meritPoints; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getAwardedAt() { return awardedAt; }
    public void setAwardedAt(LocalDate awardedAt) { this.awardedAt = awardedAt; }
}
