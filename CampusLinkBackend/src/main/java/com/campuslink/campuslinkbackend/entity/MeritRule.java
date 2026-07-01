package com.campuslink.campuslinkbackend.entity;

import javax.persistence.*;

@Entity
@Table(name = "merit_rule")
public class MeritRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "programme_level", nullable = false)
    private String programmeLevel;

    @Column(name = "role_type", nullable = false)
    private String roleType;

    @Column(name = "merit_points", nullable = false)
    private Integer meritPoints;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProgrammeLevel() { return programmeLevel; }
    public void setProgrammeLevel(String programmeLevel) { this.programmeLevel = programmeLevel; }
    public String getRoleType() { return roleType; }
    public void setRoleType(String roleType) { this.roleType = roleType; }
    public Integer getMeritPoints() { return meritPoints; }
    public void setMeritPoints(Integer meritPoints) { this.meritPoints = meritPoints; }
}
