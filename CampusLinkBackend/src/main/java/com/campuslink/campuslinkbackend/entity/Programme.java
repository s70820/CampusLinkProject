package com.campuslink.campuslinkbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "programme")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Programme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    private String category;

    @Column(name = "programme_level")
    private String programmeLevel;

    @Column(name = "programme_type")
    private String programmeType;

    @Column(name = "organizer_club")
    private String organizerClub;

    @Column(columnDefinition = "LONGTEXT")
    private String objectives;

    @Column(name = "expected_outcomes", columnDefinition = "LONGTEXT")
    private String expectedOutcomes;

    private String venue;

    @Column(name = "google_maps_link")
    private String googleMapsLink;

    @Column(name = "communication_link")
    private String communicationLink;

    @Column(name = "custom_registration_fields_json", columnDefinition = "TEXT")
    private String customRegistrationFieldsJson;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "expected_participants")
    private Integer expectedParticipants;

    @Column(name = "expected_student_participants")
    private Integer expectedStudentParticipants;

    @Column(name = "expected_staff_participants")
    private Integer expectedStaffParticipants;

    @Column(name = "expected_external_participants")
    private Integer expectedExternalParticipants;

    @Column(name = "poster_path")
    private String posterPath;

    @Column(name = "advisor_signed_form_path")
    private String advisorSignedFormPath;

    @Column(name = "merit_points")
    private Integer meritPoints;

    private String status;

    @Column(name = "mpp_status")
    private String mppStatus;

    @Column(name = "hepa_status")
    private String hepaStatus;

    @Column(name = "mpp_remarks", columnDefinition = "TEXT")
    private String mppRemarks;

    @Column(name = "hepa_remarks", columnDefinition = "TEXT")
    private String hepaRemarks;

    @Column(name = "registration_open_date")
    private LocalDate registrationOpenDate;

    @Column(name = "registration_close_date")
    private LocalDate registrationCloseDate;

    @Column(name = "collaborating_organization")
    private String collaboratingOrganization;

    @Column(name = "sponsorship_info", columnDefinition = "TEXT")
    private String sponsorshipInfo;

    @Column(name = "is_paid")
    private Boolean isPaid = false;

    @Column(name = "registration_fee")
    private java.math.BigDecimal registrationFee;

    @Column(name = "payment_instructions", columnDefinition = "TEXT")
    private String paymentInstructions;

    @Column(name = "payment_reference_format")
    private String paymentReferenceFormat;

    @Column(name = "payment_qr_path")
    private String paymentQrPath;

    @Column(name = "is_team_programme")
    private Boolean isTeamProgramme = false;

    @Column(name = "team_name_required")
    private Boolean teamNameRequired = true;

    @Column(name = "min_team_size")
    private Integer minTeamSize;

    @Column(name = "max_team_size")
    private Integer maxTeamSize;

    @Column(name = "certificate_mode")
    private String certificateMode = "SYSTEM";

    @Column(name = "certificate_template")
    private String certificateTemplate = "GEOMETRIC_MODERN";

    @Column(name = "certificate_orientation")
    private String certificateOrientation = "PORTRAIT";

    @Column(name = "advisor_signature_path")
    private String advisorSignaturePath;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "draft_expiry_warning_sent_at")
    private LocalDateTime draftExpiryWarningSentAt;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    @JsonIgnore
    private User organizer;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Programme() {
    }

    // Generate Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProgrammeLevel() {
        return programmeLevel;
    }

    public void setProgrammeLevel(String programmeLevel) {
        this.programmeLevel = programmeLevel;
    }

    public String getProgrammeType() {
        return programmeType;
    }

    public void setProgrammeType(String programmeType) {
        this.programmeType = programmeType;
    }

    public String getOrganizerClub() {
        return organizerClub;
    }

    public void setOrganizerClub(String organizerClub) {
        this.organizerClub = organizerClub;
    }

    public String getObjectives() {
        return objectives;
    }

    public void setObjectives(String objectives) {
        this.objectives = objectives;
    }

    public String getExpectedOutcomes() {
        return expectedOutcomes;
    }

    public void setExpectedOutcomes(String expectedOutcomes) {
        this.expectedOutcomes = expectedOutcomes;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getGoogleMapsLink() {
        return googleMapsLink;
    }

    public void setGoogleMapsLink(String googleMapsLink) {
        this.googleMapsLink = googleMapsLink;
    }

    public String getCommunicationLink() {
        return communicationLink;
    }

    public void setCommunicationLink(String communicationLink) {
        this.communicationLink = communicationLink;
    }

    public String getCustomRegistrationFieldsJson() {
        return customRegistrationFieldsJson;
    }

    public void setCustomRegistrationFieldsJson(String customRegistrationFieldsJson) {
        this.customRegistrationFieldsJson = customRegistrationFieldsJson;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getExpectedParticipants() {
        return expectedParticipants;
    }

    public void setExpectedParticipants(Integer expectedParticipants) {
        this.expectedParticipants = expectedParticipants;
    }

    public String getPosterPath() {
        return posterPath;
    }

    public void setPosterPath(String posterPath) {
        this.posterPath = posterPath;
    }

    public String getAdvisorSignedFormPath() {
        return advisorSignedFormPath;
    }

    public void setAdvisorSignedFormPath(String advisorSignedFormPath) {
        this.advisorSignedFormPath = advisorSignedFormPath;
    }

    public Integer getMeritPoints() {
        return meritPoints;
    }

    public void setMeritPoints(Integer meritPoints) {
        this.meritPoints = meritPoints;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMppStatus() {
        return mppStatus;
    }

    public void setMppStatus(String mppStatus) {
        this.mppStatus = mppStatus;
    }

    public String getHepaStatus() {
        return hepaStatus;
    }

    public void setHepaStatus(String hepaStatus) {
        this.hepaStatus = hepaStatus;
    }

    public String getMppRemarks() {
        return mppRemarks;
    }

    public void setMppRemarks(String mppRemarks) {
        this.mppRemarks = mppRemarks;
    }

    public String getHepaRemarks() {
        return hepaRemarks;
    }

    public void setHepaRemarks(String hepaRemarks) {
        this.hepaRemarks = hepaRemarks;
    }

    @JsonIgnore
    public User getOrganizer() {
        return organizer;
    }

    public void setOrganizer(User organizer) {
        this.organizer = organizer;
    }

    public LocalDate getRegistrationOpenDate() { return registrationOpenDate; }
    public void setRegistrationOpenDate(LocalDate registrationOpenDate) { this.registrationOpenDate = registrationOpenDate; }
    public LocalDate getRegistrationCloseDate() { return registrationCloseDate; }
    public void setRegistrationCloseDate(LocalDate registrationCloseDate) { this.registrationCloseDate = registrationCloseDate; }
    public String getCollaboratingOrganization() { return collaboratingOrganization; }
    public void setCollaboratingOrganization(String collaboratingOrganization) { this.collaboratingOrganization = collaboratingOrganization; }
    public String getSponsorshipInfo() { return sponsorshipInfo; }
    public void setSponsorshipInfo(String sponsorshipInfo) { this.sponsorshipInfo = sponsorshipInfo; }
    public LocalDateTime getArchivedAt() { return archivedAt; }
    public void setArchivedAt(LocalDateTime archivedAt) { this.archivedAt = archivedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getDraftExpiryWarningSentAt() { return draftExpiryWarningSentAt; }
    public void setDraftExpiryWarningSentAt(LocalDateTime draftExpiryWarningSentAt) {
        this.draftExpiryWarningSentAt = draftExpiryWarningSentAt;
    }

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
    public String getCertificateMode() { return certificateMode; }
    public void setCertificateMode(String certificateMode) { this.certificateMode = certificateMode; }
    public String getCertificateTemplate() { return certificateTemplate; }
    public void setCertificateTemplate(String certificateTemplate) { this.certificateTemplate = certificateTemplate; }
    public String getCertificateOrientation() { return certificateOrientation; }
    public void setCertificateOrientation(String certificateOrientation) {
        this.certificateOrientation = certificateOrientation;
    }
    public String getAdvisorSignaturePath() { return advisorSignaturePath; }
    public void setAdvisorSignaturePath(String advisorSignaturePath) { this.advisorSignaturePath = advisorSignaturePath; }
    public Integer getExpectedStudentParticipants() { return expectedStudentParticipants; }
    public void setExpectedStudentParticipants(Integer expectedStudentParticipants) {
        this.expectedStudentParticipants = expectedStudentParticipants;
    }
    public Integer getExpectedStaffParticipants() { return expectedStaffParticipants; }
    public void setExpectedStaffParticipants(Integer expectedStaffParticipants) {
        this.expectedStaffParticipants = expectedStaffParticipants;
    }
    public Integer getExpectedExternalParticipants() { return expectedExternalParticipants; }
    public void setExpectedExternalParticipants(Integer expectedExternalParticipants) {
        this.expectedExternalParticipants = expectedExternalParticipants;
    }
}