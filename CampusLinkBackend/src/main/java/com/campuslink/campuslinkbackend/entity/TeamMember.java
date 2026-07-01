package com.campuslink.campuslinkbackend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_member")
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_registration_id", nullable = false)
    private TeamRegistration teamRegistration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "matric_number", nullable = false)
    private String matricNumber;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "invitation_status", nullable = false)
    private String invitationStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_registration_id")
    private ProgrammeRegistration programmeRegistration;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TeamRegistration getTeamRegistration() { return teamRegistration; }
    public void setTeamRegistration(TeamRegistration teamRegistration) { this.teamRegistration = teamRegistration; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getMatricNumber() { return matricNumber; }
    public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getInvitationStatus() { return invitationStatus; }
    public void setInvitationStatus(String invitationStatus) { this.invitationStatus = invitationStatus; }
    public ProgrammeRegistration getProgrammeRegistration() { return programmeRegistration; }
    public void setProgrammeRegistration(ProgrammeRegistration programmeRegistration) { this.programmeRegistration = programmeRegistration; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
