package com.campuslink.campuslinkbackend.dto;

public class ProgrammeRegistrationAvailabilityDto {
    private Long programmeId;
    private Integer maxParticipants;
    private long occupiedSlots;
    private Long slotsRemaining;
    private boolean full;
    private boolean canRegister;
    private boolean eligibleToRegister = true;
    private String registrationRestrictionReason;
    private boolean alreadyRegistered;
    private String userRegistrationStatus;

    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public long getOccupiedSlots() { return occupiedSlots; }
    public void setOccupiedSlots(long occupiedSlots) { this.occupiedSlots = occupiedSlots; }
    public Long getSlotsRemaining() { return slotsRemaining; }
    public void setSlotsRemaining(Long slotsRemaining) { this.slotsRemaining = slotsRemaining; }
    public boolean isFull() { return full; }
    public void setFull(boolean full) { this.full = full; }
    public boolean isCanRegister() { return canRegister; }
    public void setCanRegister(boolean canRegister) { this.canRegister = canRegister; }
    public boolean isEligibleToRegister() { return eligibleToRegister; }
    public void setEligibleToRegister(boolean eligibleToRegister) { this.eligibleToRegister = eligibleToRegister; }
    public String getRegistrationRestrictionReason() { return registrationRestrictionReason; }
    public void setRegistrationRestrictionReason(String registrationRestrictionReason) {
        this.registrationRestrictionReason = registrationRestrictionReason;
    }
    public boolean isAlreadyRegistered() { return alreadyRegistered; }
    public void setAlreadyRegistered(boolean alreadyRegistered) { this.alreadyRegistered = alreadyRegistered; }
    public String getUserRegistrationStatus() { return userRegistrationStatus; }
    public void setUserRegistrationStatus(String userRegistrationStatus) {
        this.userRegistrationStatus = userRegistrationStatus;
    }
}
