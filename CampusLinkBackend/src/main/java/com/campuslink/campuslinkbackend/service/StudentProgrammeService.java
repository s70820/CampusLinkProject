package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.constants.RegistrationStatus;
import com.campuslink.campuslinkbackend.dto.ProgrammeBrowseDto;
import com.campuslink.campuslinkbackend.dto.ProgrammeCustomFieldDto;
import com.campuslink.campuslinkbackend.dto.ProgrammeRegistrationAvailabilityDto;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.ProgrammeSdg;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ProgrammeRegistrationRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeSdgRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.util.FileUrlHelper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentProgrammeService {

    private static final List<String> OCCUPYING_STATUSES = Arrays.asList(
            RegistrationStatus.ACTIVE,
            RegistrationStatus.PENDING_PAYMENT_VERIFICATION,
            RegistrationStatus.PENDING_TEAM,
            RegistrationStatus.PENDING_INVITE,
            RegistrationStatus.PENDING_PAYMENT
    );

    private final ProgrammeRepository programmeRepository;
    private final ProgrammeSdgRepository programmeSdgRepository;
    private final ProgrammeRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final ProgrammeRegistrationEligibilityService eligibilityService;
    private final ObjectMapper objectMapper;

    public StudentProgrammeService(
            ProgrammeRepository programmeRepository,
            ProgrammeSdgRepository programmeSdgRepository,
            ProgrammeRegistrationRepository registrationRepository,
            UserRepository userRepository,
            ProgrammeRegistrationEligibilityService eligibilityService,
            ObjectMapper objectMapper) {
        this.programmeRepository = programmeRepository;
        this.programmeSdgRepository = programmeSdgRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.eligibilityService = eligibilityService;
        this.objectMapper = objectMapper;
    }

    public List<ProgrammeBrowseDto> getApprovedProgrammesForBrowse(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();
        return programmeRepository.findByStatusWithOrganizer(WorkflowStatus.APPROVED).stream()
                .filter(programme -> isBrowsableProgramme(programme, today))
                .sorted(Comparator
                        .comparing(Programme::getStartDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Programme::getTitle, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(programme -> toBrowseDto(programme, user))
                .collect(Collectors.toList());
    }

    private boolean isBrowsableProgramme(Programme programme, LocalDate today) {
        if (programme.getEndDate() != null && programme.getEndDate().isBefore(today)) {
            return false;
        }
        if (programme.getRegistrationCloseDate() != null
                && programme.getRegistrationCloseDate().isBefore(today)) {
            return false;
        }
        return true;
    }

    public ProgrammeBrowseDto getApprovedProgrammeById(Long id, Long userId) {
        User user = resolveUser(userId);
        Programme programme = programmeRepository.findByIdWithOrganizer(id)
                .filter(p -> WorkflowStatus.APPROVED.equals(p.getStatus()))
                .orElse(null);
        return programme == null ? null : toBrowseDto(programme, user);
    }

    public ProgrammeRegistrationAvailabilityDto getRegistrationAvailability(Long programmeId, Long userId) {
        Programme programme = programmeRepository.findByIdWithOrganizer(programmeId)
                .filter(p -> WorkflowStatus.APPROVED.equals(p.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme not found."));

        User user = resolveUser(userId);
        ProgrammeRegistrationAvailabilityDto dto = new ProgrammeRegistrationAvailabilityDto();
        dto.setProgrammeId(programmeId);
        dto.setMaxParticipants(programme.getExpectedParticipants());

        long occupied = registrationRepository.countByProgrammeIdAndStatusIn(programmeId, OCCUPYING_STATUSES);
        dto.setOccupiedSlots(occupied);

        applyEligibility(dto, programme, user);

        Integer max = programme.getExpectedParticipants();
        if (max == null || max <= 0) {
            dto.setFull(false);
            dto.setSlotsRemaining(null);
            dto.setCanRegister(dto.isEligibleToRegister()
                    && !dto.isAlreadyRegistered()
                    && isBrowsableProgramme(programme, LocalDate.now()));
            return dto;
        }

        long remaining = Math.max(0, max - occupied);
        dto.setSlotsRemaining(remaining);
        dto.setFull(remaining <= 0);
        dto.setCanRegister(remaining > 0
                && dto.isEligibleToRegister()
                && !dto.isAlreadyRegistered()
                && isBrowsableProgramme(programme, LocalDate.now()));
        return dto;
    }

    private ProgrammeBrowseDto toBrowseDto(Programme programme, User user) {
        ProgrammeBrowseDto dto = new ProgrammeBrowseDto();
        dto.setId(programme.getId());
        dto.setTitle(programme.getTitle());
        dto.setDescription(programme.getDescription());
        dto.setObjectives(programme.getObjectives());
        dto.setExpectedOutcomes(programme.getExpectedOutcomes());
        dto.setCategory(programme.getCategory());
        dto.setProgrammeLevel(programme.getProgrammeLevel());
        dto.setProgrammeType(programme.getProgrammeType());
        dto.setOrganizerClub(programme.getOrganizerClub());
        dto.setVenue(programme.getVenue());
        dto.setStartDate(programme.getStartDate());
        dto.setEndDate(programme.getEndDate());
        dto.setStartTime(programme.getStartTime());
        dto.setEndTime(programme.getEndTime());
        dto.setMeritPoints(programme.getMeritPoints());
        dto.setExpectedParticipants(programme.getExpectedParticipants());
        dto.setPosterPath(FileUrlHelper.toPublicUrl(programme.getPosterPath()));
        dto.setRegistrationOpenDate(programme.getRegistrationOpenDate());
        dto.setRegistrationCloseDate(programme.getRegistrationCloseDate());
        dto.setStatus(programme.getStatus());
        dto.setIsPaid(programme.getIsPaid());
        dto.setRegistrationFee(programme.getRegistrationFee());
        dto.setPaymentInstructions(programme.getPaymentInstructions());
        dto.setPaymentReferenceFormat(programme.getPaymentReferenceFormat());
        dto.setPaymentQrPath(FileUrlHelper.toPublicUrl(programme.getPaymentQrPath()));
        dto.setIsTeamProgramme(programme.getIsTeamProgramme());
        dto.setTeamNameRequired(programme.getTeamNameRequired());
        dto.setMinTeamSize(programme.getMinTeamSize());
        dto.setMaxTeamSize(programme.getMaxTeamSize());

        List<Integer> sdgNumbers = programmeSdgRepository.findByProgrammeId(programme.getId()).stream()
                .map(ProgrammeSdg::getSdgNumber)
                .sorted()
                .collect(Collectors.toList());
        dto.setSdgNumbers(sdgNumbers);
        dto.setCustomRegistrationFields(parseCustomFields(programme.getCustomRegistrationFieldsJson()));
        dto.setMaxParticipants(programme.getExpectedParticipants());

        Integer max = programme.getExpectedParticipants();
        if (max != null && max > 0) {
            long occupied = registrationRepository.countByProgrammeIdAndStatusIn(
                    programme.getId(), OCCUPYING_STATUSES);
            long remaining = Math.max(0, max - occupied);
            dto.setSlotsRemaining(remaining);
            dto.setRegistrationFull(remaining <= 0);
        } else {
            dto.setRegistrationFull(false);
        }

        if (user != null) {
            applyUserRegistrationState(dto, programme, user);
        }

        return dto;
    }

    private void applyUserRegistrationState(ProgrammeBrowseDto dto, Programme programme, User user) {
        registrationRepository.findByProgrammeIdAndUserId(programme.getId(), user.getId())
                .filter(registration -> OCCUPYING_STATUSES.contains(registration.getStatus()))
                .ifPresent(registration -> {
                    dto.setAlreadyRegistered(true);
                    dto.setUserRegistrationStatus(registration.getStatus());
                    dto.setEligibleToRegister(false);
                    dto.setRegistrationRestrictionReason(
                            registrationRestrictionMessage(registration.getStatus()));
                });

        if (dto.isAlreadyRegistered()) {
            return;
        }

        String restrictionReason = eligibilityService.getRestrictionReason(programme, user);
        dto.setEligibleToRegister(restrictionReason == null);
        dto.setRegistrationRestrictionReason(restrictionReason);
    }

    private void applyEligibility(
            ProgrammeRegistrationAvailabilityDto dto,
            Programme programme,
            User user) {
        if (user == null) {
            dto.setEligibleToRegister(true);
            dto.setRegistrationRestrictionReason(null);
            dto.setAlreadyRegistered(false);
            return;
        }

        registrationRepository.findByProgrammeIdAndUserId(programme.getId(), user.getId())
                .filter(registration -> OCCUPYING_STATUSES.contains(registration.getStatus()))
                .ifPresent(registration -> {
                    dto.setAlreadyRegistered(true);
                    dto.setUserRegistrationStatus(registration.getStatus());
                    dto.setEligibleToRegister(false);
                    dto.setRegistrationRestrictionReason(
                            registrationRestrictionMessage(registration.getStatus()));
                });

        if (dto.isAlreadyRegistered()) {
            return;
        }

        String restrictionReason = eligibilityService.getRestrictionReason(programme, user);
        dto.setEligibleToRegister(restrictionReason == null);
        dto.setRegistrationRestrictionReason(restrictionReason);
    }

    private static String registrationRestrictionMessage(String status) {
        if (RegistrationStatus.PENDING_INVITE.equals(status)) {
            return "You have a pending team invitation for this programme. "
                    + "Open Notifications to accept or reject.";
        }
        return "You are already registered for this programme.";
    }

    private User resolveUser(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).orElse(null);
    }

    private List<ProgrammeCustomFieldDto> parseCustomFields(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<ProgrammeCustomFieldDto>>() {});
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }
}
