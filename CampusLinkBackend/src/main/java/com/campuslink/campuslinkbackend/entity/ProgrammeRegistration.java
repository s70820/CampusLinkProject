package com.campuslink.campuslinkbackend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "programme_registration")
public class ProgrammeRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "registration_type", nullable = false)
    private String registrationType = "INDIVIDUAL";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_registration_id")
    private TeamRegistration teamRegistration;

    @Column(nullable = false)
    private String status;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "custom_responses_json", columnDefinition = "TEXT")
    private String customResponsesJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getRegistrationType() { return registrationType; }
    public void setRegistrationType(String registrationType) { this.registrationType = registrationType; }
    public TeamRegistration getTeamRegistration() { return teamRegistration; }
    public void setTeamRegistration(TeamRegistration teamRegistration) { this.teamRegistration = teamRegistration; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public String getCustomResponsesJson() { return customResponsesJson; }
    public void setCustomResponsesJson(String customResponsesJson) { this.customResponsesJson = customResponsesJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
