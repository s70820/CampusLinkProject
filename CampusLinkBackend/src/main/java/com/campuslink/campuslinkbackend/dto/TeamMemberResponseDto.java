package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDateTime;

public class TeamMemberResponseDto {
    private Long id;
    private String fullName;
    private String matricNumber;
    private String phoneNumber;
    private String invitationStatus;
    private LocalDateTime respondedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getMatricNumber() { return matricNumber; }
    public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getInvitationStatus() { return invitationStatus; }
    public void setInvitationStatus(String invitationStatus) { this.invitationStatus = invitationStatus; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
