package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class ProgrammeBrowseDto {

    private Long id;
    private String title;
    private String description;
    private String objectives;
    private String expectedOutcomes;
    private String category;
    private String programmeLevel;
    private String programmeType;
    private String organizerClub;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer meritPoints;
    private Integer expectedParticipants;
    private String posterPath;
    private LocalDate registrationOpenDate;
    private LocalDate registrationCloseDate;
    private String status;
    private Boolean isPaid;
    private java.math.BigDecimal registrationFee;
    private String paymentInstructions;
    private String paymentReferenceFormat;
    private String paymentQrPath;
    private Boolean isTeamProgramme;
    private Boolean teamNameRequired;
    private Integer minTeamSize;
    private Integer maxTeamSize;
    private List<Integer> sdgNumbers = new ArrayList<>();
    private List<ProgrammeCustomFieldDto> customRegistrationFields = new ArrayList<>();
    private Integer maxParticipants;
    private Long slotsRemaining;
    private boolean registrationFull;
    private Boolean eligibleToRegister;
    private String registrationRestrictionReason;
    private boolean alreadyRegistered;
    private String userRegistrationStatus;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getObjectives() { return objectives; }
    public void setObjectives(String objectives) { this.objectives = objectives; }
    public String getExpectedOutcomes() { return expectedOutcomes; }
    public void setExpectedOutcomes(String expectedOutcomes) { this.expectedOutcomes = expectedOutcomes; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getProgrammeLevel() { return programmeLevel; }
    public void setProgrammeLevel(String programmeLevel) { this.programmeLevel = programmeLevel; }
    public String getProgrammeType() { return programmeType; }
    public void setProgrammeType(String programmeType) { this.programmeType = programmeType; }
    public String getOrganizerClub() { return organizerClub; }
    public void setOrganizerClub(String organizerClub) { this.organizerClub = organizerClub; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public Integer getMeritPoints() { return meritPoints; }
    public void setMeritPoints(Integer meritPoints) { this.meritPoints = meritPoints; }
    public Integer getExpectedParticipants() { return expectedParticipants; }
    public void setExpectedParticipants(Integer expectedParticipants) { this.expectedParticipants = expectedParticipants; }
    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }
    public LocalDate getRegistrationOpenDate() { return registrationOpenDate; }
    public void setRegistrationOpenDate(LocalDate registrationOpenDate) { this.registrationOpenDate = registrationOpenDate; }
    public LocalDate getRegistrationCloseDate() { return registrationCloseDate; }
    public void setRegistrationCloseDate(LocalDate registrationCloseDate) { this.registrationCloseDate = registrationCloseDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<Integer> getSdgNumbers() { return sdgNumbers; }
    public void setSdgNumbers(List<Integer> sdgNumbers) { this.sdgNumbers = sdgNumbers; }
    public Boolean getIsPaid() { return isPaid; }
    public void setIsPaid(Boolean isPaid) { this.isPaid = isPaid; }
    public java.math.BigDecimal getRegistrationFee() { return registrationFee; }
    public void setRegistrationFee(java.math.BigDecimal registrationFee) { this.registrationFee = registrationFee; }
    public String getPaymentInstructions() { return paymentInstructions; }
    public void setPaymentInstructions(String paymentInstructions) { this.paymentInstructions = paymentInstructions; }
    public String getPaymentReferenceFormat() { return paymentReferenceFormat; }
    public void setPaymentReferenceFormat(String paymentReferenceFormat) { this.paymentReferenceFormat = paymentReferenceFormat; }
    public String getPaymentQrPath() { return paymentQrPath; }
    public void setPaymentQrPath(String paymentQrPath) { this.paymentQrPath = paymentQrPath; }
    public Boolean getIsTeamProgramme() { return isTeamProgramme; }
    public void setIsTeamProgramme(Boolean isTeamProgramme) { this.isTeamProgramme = isTeamProgramme; }
    public Boolean getTeamNameRequired() { return teamNameRequired; }
    public void setTeamNameRequired(Boolean teamNameRequired) { this.teamNameRequired = teamNameRequired; }
    public Integer getMinTeamSize() { return minTeamSize; }
    public void setMinTeamSize(Integer minTeamSize) { this.minTeamSize = minTeamSize; }
    public Integer getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(Integer maxTeamSize) { this.maxTeamSize = maxTeamSize; }
    public List<ProgrammeCustomFieldDto> getCustomRegistrationFields() { return customRegistrationFields; }
    public void setCustomRegistrationFields(List<ProgrammeCustomFieldDto> customRegistrationFields) {
        this.customRegistrationFields = customRegistrationFields;
    }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public Long getSlotsRemaining() { return slotsRemaining; }
    public void setSlotsRemaining(Long slotsRemaining) { this.slotsRemaining = slotsRemaining; }
    public boolean isRegistrationFull() { return registrationFull; }
    public void setRegistrationFull(boolean registrationFull) { this.registrationFull = registrationFull; }
    public Boolean getEligibleToRegister() { return eligibleToRegister; }
    public void setEligibleToRegister(Boolean eligibleToRegister) { this.eligibleToRegister = eligibleToRegister; }
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
