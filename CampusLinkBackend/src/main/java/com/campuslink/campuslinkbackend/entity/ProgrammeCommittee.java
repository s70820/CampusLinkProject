package com.campuslink.campuslinkbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "programme_committee")
public class ProgrammeCommittee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id", nullable = false)
    @JsonIgnore
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    @JsonIgnore
    private User student;

    @Column(name = "matric_number", nullable = false)
    private String matricNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String faculty;

    @Column(name = "committee_role", nullable = false)
    private String committeeRole;

    @Column(name = "merit_role_type", nullable = false)
    private String meritRoleType;

    @Column(name = "merit_points")
    private Integer meritPoints;

    @Column(name = "has_campuslink_account")
    private Boolean hasCampuslinkAccount = false;

    @Column(name = "position_label")
    private String positionLabel;

    @Column(name = "contribution_description")
    private String contributionDescription;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getMatricNumber() { return matricNumber; }
    public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public String getCommitteeRole() { return committeeRole; }
    public void setCommitteeRole(String committeeRole) { this.committeeRole = committeeRole; }
    public String getMeritRoleType() { return meritRoleType; }
    public void setMeritRoleType(String meritRoleType) { this.meritRoleType = meritRoleType; }
    public Integer getMeritPoints() { return meritPoints; }
    public void setMeritPoints(Integer meritPoints) { this.meritPoints = meritPoints; }
    public Boolean getHasCampuslinkAccount() { return hasCampuslinkAccount; }
    public void setHasCampuslinkAccount(Boolean hasCampuslinkAccount) { this.hasCampuslinkAccount = hasCampuslinkAccount; }
    public String getPositionLabel() { return positionLabel; }
    public void setPositionLabel(String positionLabel) { this.positionLabel = positionLabel; }
    public String getContributionDescription() { return contributionDescription; }
    public void setContributionDescription(String contributionDescription) { this.contributionDescription = contributionDescription; }
}
