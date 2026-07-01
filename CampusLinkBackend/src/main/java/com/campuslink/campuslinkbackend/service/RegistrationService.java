package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.InvitationStatus;
import com.campuslink.campuslinkbackend.constants.RegistrationStatus;
import com.campuslink.campuslinkbackend.constants.TeamRegistrationStatus;
import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.dto.ProgrammeCustomFieldDto;
import com.campuslink.campuslinkbackend.dto.RegistrationResponseDto;
import com.campuslink.campuslinkbackend.dto.StudentLookupResponse;
import com.campuslink.campuslinkbackend.dto.TeamMemberResponseDto;
import com.campuslink.campuslinkbackend.dto.TeamRegistrationDetailDto;
import com.campuslink.campuslinkbackend.dto.TeammateInviteDto;
import com.campuslink.campuslinkbackend.entity.*;
import com.campuslink.campuslinkbackend.repository.*;
import com.campuslink.campuslinkbackend.util.FileUrlHelper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    private static final List<String> OCCUPYING_STATUSES = Arrays.asList(
            RegistrationStatus.ACTIVE,
            RegistrationStatus.PENDING_PAYMENT_VERIFICATION,
            RegistrationStatus.PENDING_TEAM,
            RegistrationStatus.PENDING_INVITE,
            RegistrationStatus.PENDING_PAYMENT
    );

    private final ProgrammeRepository programmeRepository;
    private final ProgrammeRegistrationRepository registrationRepository;
    private final TeamRegistrationRepository teamRegistrationRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;
    private final PaymentVerificationRepository paymentVerificationRepository;
    private final StudentNotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final StudentLookupService studentLookupService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final ProgrammeRegistrationEligibilityService eligibilityService;

    public RegistrationService(
            ProgrammeRepository programmeRepository,
            ProgrammeRegistrationRepository registrationRepository,
            TeamRegistrationRepository teamRegistrationRepository,
            TeamMemberRepository teamMemberRepository,
            PaymentReceiptRepository paymentReceiptRepository,
            PaymentVerificationRepository paymentVerificationRepository,
            StudentNotificationRepository notificationRepository,
            UserRepository userRepository,
            StudentLookupService studentLookupService,
            FileStorageService fileStorageService,
            ObjectMapper objectMapper,
            NotificationService notificationService,
            ProgrammeRegistrationEligibilityService eligibilityService) {
        this.programmeRepository = programmeRepository;
        this.registrationRepository = registrationRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.paymentReceiptRepository = paymentReceiptRepository;
        this.paymentVerificationRepository = paymentVerificationRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.studentLookupService = studentLookupService;
        this.fileStorageService = fileStorageService;
        this.objectMapper = objectMapper;
        this.notificationService = notificationService;
        this.eligibilityService = eligibilityService;
    }

    @Transactional
    public RegistrationResponseDto registerIndividual(
            Long userId,
            Long programmeId,
            String paymentReference,
            MultipartFile receipt,
            String customResponsesJson) {
        User user = requireUser(userId);
        Programme programme = requireOpenProgramme(programmeId);
        eligibilityService.ensureEligibleParticipant(programme, user);
        ensureNotRegistered(programmeId, userId);
        ensureCapacityAvailable(programme);

        if (Boolean.TRUE.equals(programme.getIsTeamProgramme())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This is a team programme. Please use team registration.");
        }

        String responsesJson = validateAndSerializeCustomResponses(programme, customResponsesJson);

        ProgrammeRegistration registration = new ProgrammeRegistration();
        registration.setProgramme(programme);
        registration.setUser(user);
        registration.setRegistrationType("INDIVIDUAL");
        registration.setPaymentReference(paymentReference);
        registration.setCustomResponsesJson(responsesJson);

        if (Boolean.TRUE.equals(programme.getIsPaid())) {
            if (paymentReference == null || paymentReference.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment reference is required.");
            }
            if (receipt == null || receipt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment receipt is required.");
            }
            registration.setStatus(RegistrationStatus.PENDING_PAYMENT_VERIFICATION);
            registration = registrationRepository.save(registration);
            savePaymentReceipt(registration, receipt, paymentReference, programme.getOrganizer());
        } else {
            registration.setStatus(RegistrationStatus.ACTIVE);
            registration = registrationRepository.save(registration);
            notifyRegistrationConfirmed(registration);
        }

        return toDto(registration);
    }

    @Transactional
    public RegistrationResponseDto registerTeam(
            Long userId,
            Long programmeId,
            String teamName,
            List<TeammateInviteDto> teammates,
            String paymentReference,
            MultipartFile receipt,
            String customResponsesJson) {

        User leader = requireUser(userId);
        Programme programme = requireOpenProgramme(programmeId);
        eligibilityService.ensureEligibleParticipant(programme, leader);
        ensureNotRegistered(programmeId, userId);
        ensureCapacityAvailable(programme);
        String responsesJson = validateAndSerializeCustomResponses(programme, customResponsesJson);

        if (!Boolean.TRUE.equals(programme.getIsTeamProgramme())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This programme does not support team registration.");
        }
        if (teamName == null || teamName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team name is required.");
        }

        List<TeammateInviteDto> invites = teammates != null ? teammates : new ArrayList<>();
        Integer minSize = programme.getMinTeamSize();
        Integer maxSize = programme.getMaxTeamSize();
        java.util.Set<String> seenMatrics = new java.util.LinkedHashSet<>();

        for (TeammateInviteDto invite : invites) {
            if (invite.getMatricNumber() == null || invite.getMatricNumber().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Matric number is required for every teammate.");
            }
            String matric = invite.getMatricNumber().trim().toUpperCase();
            if (!seenMatrics.add(matric)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Duplicate matric number in team list: " + matric);
            }
            if (invite.getPhoneNumber() == null || invite.getPhoneNumber().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Phone number is required for teammate " + matric);
            }
        }

        int totalMembers = 1 + invites.size();
        if (minSize != null && totalMembers < minSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This programme requires at least " + minSize + " team members including you. "
                    + "Add " + (minSize - 1) + " teammate(s) before registering.");
        }
        if (maxSize != null && totalMembers > maxSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Team exceeds maximum size of " + maxSize + ".");
        }

        if (Boolean.TRUE.equals(programme.getIsPaid())) {
            if (paymentReference == null || paymentReference.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment reference is required.");
            }
            if (receipt == null || receipt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment receipt is required.");
            }
        }

        TeamRegistration team = new TeamRegistration();
        team.setProgramme(programme);
        team.setLeader(leader);
        team.setTeamName(teamName.trim());
        team.setStatus(TeamRegistrationStatus.BUILDING);
        team = teamRegistrationRepository.save(team);

        ProgrammeRegistration leaderReg = prepareProgrammeRegistration(
                programme, leader, "TEAM_LEADER", team);
        leaderReg.setPaymentReference(paymentReference);
        leaderReg.setCustomResponsesJson(responsesJson);

        if (Boolean.TRUE.equals(programme.getIsPaid())) {
            if (receipt == null || receipt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment receipt is required.");
            }
            leaderReg.setStatus(RegistrationStatus.PENDING_PAYMENT_VERIFICATION);
            leaderReg = registrationRepository.save(leaderReg);
            savePaymentReceipt(leaderReg, receipt, paymentReference, programme.getOrganizer());
        } else {
            leaderReg.setStatus(RegistrationStatus.PENDING_TEAM);
            leaderReg = registrationRepository.save(leaderReg);
        }

        TeamMember leaderMember = new TeamMember();
        leaderMember.setTeamRegistration(team);
        leaderMember.setUser(leader);
        leaderMember.setMatricNumber(leader.getMatricNumber());
        leaderMember.setPhoneNumber(leader.getPhoneNumber());
        leaderMember.setInvitationStatus(InvitationStatus.ACCEPTED);
        leaderMember.setProgrammeRegistration(leaderReg);
        teamMemberRepository.save(leaderMember);

        for (TeammateInviteDto invite : invites) {
            String matric = invite.getMatricNumber().trim().toUpperCase();
            if (matric.equals(leader.getMatricNumber())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "You cannot invite yourself as a teammate.");
            }
            eligibilityService.ensureMatricEligible(programme, matric);
            StudentLookupResponse lookup = studentLookupService.lookupRegisteredParticipantForTeam(
                    matric, programmeId);
            User teammate = userRepository.findById(lookup.getCampusLinkUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Teammate account not found for matric " + matric));

            ensureTeammateAvailable(programmeId, teammate.getId(), team.getId());

            String phone = resolveTeammatePhone(invite.getPhoneNumber(), lookup.getPhoneNumber(), teammate);

            TeamMember member = new TeamMember();
            member.setTeamRegistration(team);
            member.setUser(teammate);
            member.setMatricNumber(matric);
            member.setPhoneNumber(phone);
            member.setInvitationStatus(InvitationStatus.PENDING);

            ProgrammeRegistration inviteReg = prepareProgrammeRegistration(
                    programme, teammate, "TEAM_MEMBER", team);
            inviteReg.setStatus(RegistrationStatus.PENDING_INVITE);
            inviteReg = registrationRepository.save(inviteReg);
            member.setProgrammeRegistration(inviteReg);
            member = teamMemberRepository.save(member);

            StudentNotification notification = new StudentNotification();
            notification.setUser(teammate);
            notification.setNotificationType("TEAM_INVITE");
            notification.setTitle("Team Invitation");
            String leaderName = leader.getFullName() != null ? leader.getFullName().trim() : "A student";
            String leaderMatric = leader.getMatricNumber() != null ? leader.getMatricNumber().trim() : "—";
            notification.setMessage(leaderName + " (" + leaderMatric + ") invited you to join team \""
                    + teamName + "\" for programme: " + programme.getTitle()
                    + ". Open Notifications to accept or reject this invitation.");
            notification.setReferenceType("TEAM_MEMBER");
            notification.setReferenceId(member.getId());
            notificationRepository.save(notification);
        }

        evaluateTeamStatus(team, programme, minSize);
        return toDto(leaderReg);
    }

    @Transactional
    public RegistrationResponseDto acceptTeamInvite(Long userId, Long teamMemberId) {
        TeamMember member = teamMemberRepository.findByIdAndUserId(teamMemberId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found."));

        if (!InvitationStatus.PENDING.equals(member.getInvitationStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation already responded to.");
        }

        TeamRegistration team = member.getTeamRegistration();
        if (TeamRegistrationStatus.CANCELLED.equals(team.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This team invitation is no longer active.");
        }
        Programme programme = team.getProgramme();
        eligibilityService.ensureEligibleParticipant(programme, member.getUser());
        ensureTeammateAvailable(programme.getId(), userId, team.getId());

        member.setInvitationStatus(InvitationStatus.ACCEPTED);
        member.setRespondedAt(java.time.LocalDateTime.now());

        ProgrammeRegistration reg = member.getProgrammeRegistration();
        if (reg == null) {
            reg = new ProgrammeRegistration();
            reg.setProgramme(programme);
            reg.setUser(member.getUser());
            reg.setRegistrationType("TEAM_MEMBER");
            reg.setTeamRegistration(team);
            reg = registrationRepository.save(reg);
            member.setProgrammeRegistration(reg);
        } else if (!userId.equals(reg.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation does not match your account.");
        }
        reg.setStatus(RegistrationStatus.PENDING_TEAM);
        reg = registrationRepository.save(reg);
        teamMemberRepository.save(member);

        markNotificationRead(userId, teamMemberId);
        evaluateTeamStatus(team, programme, programme.getMinTeamSize());
        return toDto(reg);
    }

    @Transactional
    public RegistrationResponseDto rejectTeamInvite(Long userId, Long teamMemberId) {
        TeamMember member = teamMemberRepository.findByIdAndUserId(teamMemberId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found."));

        if (!InvitationStatus.PENDING.equals(member.getInvitationStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation already responded to.");
        }

        member.setInvitationStatus(InvitationStatus.REJECTED);
        member.setRespondedAt(java.time.LocalDateTime.now());
        teamMemberRepository.save(member);

        TeamRegistration team = member.getTeamRegistration();
        cancelTeamRegistration(team, member);

        markNotificationRead(userId, teamMemberId);
        return null;
    }

    public List<RegistrationResponseDto> getMyRegistrations(Long userId) {
        return registrationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(registration -> !RegistrationStatus.CANCELLED.equals(registration.getStatus()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<RegistrationResponseDto> getProgrammeRegistrations(Long programmeId) {
        return registrationRepository.findByProgrammeIdOrderByCreatedAtDesc(programmeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TeamRegistrationDetailDto> getMyTeamRegistrations(Long userId) {
        return teamRegistrationRepository.findByLeader_IdOrderByCreatedAtDesc(userId).stream()
                .map(this::toTeamDetailDto)
                .collect(Collectors.toList());
    }

    public TeamRegistrationDetailDto getTeamRegistration(Long userId, Long teamRegistrationId) {
        TeamRegistration team = teamRegistrationRepository.findById(teamRegistrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team registration not found."));
        if (!team.getLeader().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the team leader can view this team.");
        }
        return toTeamDetailDto(team);
    }

    @Transactional
    public RegistrationResponseDto approvePayment(Long organizerId, Long registrationId, String remarks) {
        ProgrammeRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));
        PaymentReceipt receipt = paymentReceiptRepository.findByProgrammeRegistrationId(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No payment receipt found."));
        PaymentVerification verification = paymentVerificationRepository.findByPaymentReceiptId(receipt.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No verification record found."));

        User organizer = requireUser(organizerId);
        verification.setOrganizer(organizer);
        verification.setStatus("APPROVED");
        verification.setRemarks(remarks);
        verification.setVerifiedAt(java.time.LocalDateTime.now());
        paymentVerificationRepository.save(verification);

        registration.setStatus(RegistrationStatus.ACTIVE);
        registrationRepository.save(registration);
        notifyRegistrationConfirmed(registration);
        return toDto(registration);
    }

    @Transactional
    public RegistrationResponseDto rejectPayment(Long organizerId, Long registrationId, String remarks) {
        ProgrammeRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));
        PaymentReceipt receipt = paymentReceiptRepository.findByProgrammeRegistrationId(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No payment receipt found."));
        PaymentVerification verification = paymentVerificationRepository.findByPaymentReceiptId(receipt.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No verification record found."));

        User organizer = requireUser(organizerId);
        verification.setOrganizer(organizer);
        verification.setStatus("REJECTED");
        verification.setRemarks(remarks);
        verification.setVerifiedAt(java.time.LocalDateTime.now());
        paymentVerificationRepository.save(verification);

        registration.setStatus(RegistrationStatus.PAYMENT_REJECTED);
        registrationRepository.save(registration);
        return toDto(registration);
    }

    private void savePaymentReceipt(
            ProgrammeRegistration registration,
            MultipartFile receipt,
            String paymentReference,
            User organizer) {
        String path = fileStorageService.store(receipt, "payment-receipts");
        PaymentReceipt paymentReceipt = new PaymentReceipt();
        paymentReceipt.setProgrammeRegistration(registration);
        paymentReceipt.setFilePath(path);
        paymentReceipt.setFileName(receipt.getOriginalFilename());
        paymentReceipt.setPaymentReference(paymentReference);
        paymentReceipt = paymentReceiptRepository.save(paymentReceipt);

        PaymentVerification verification = new PaymentVerification();
        verification.setPaymentReceipt(paymentReceipt);
        verification.setOrganizer(organizer != null ? organizer : registration.getProgramme().getOrganizer());
        verification.setStatus("PENDING");
        paymentVerificationRepository.save(verification);
    }

    private void cancelTeamRegistration(TeamRegistration team, TeamMember rejectingMember) {
        if (team == null || TeamRegistrationStatus.CANCELLED.equals(team.getStatus())) {
            return;
        }

        team.setStatus(TeamRegistrationStatus.CANCELLED);
        teamRegistrationRepository.save(team);

        teamMemberRepository.findByTeamRegistrationId(team.getId()).forEach(member -> {
            if (member.getProgrammeRegistration() != null) {
                ProgrammeRegistration reg = member.getProgrammeRegistration();
                if (!RegistrationStatus.CANCELLED.equals(reg.getStatus())) {
                    reg.setStatus(RegistrationStatus.CANCELLED);
                    registrationRepository.save(reg);
                }
            }
        });

        User leader = team.getLeader();
        Programme programme = team.getProgramme();
        if (leader != null && rejectingMember != null && rejectingMember.getUser() != null && programme != null) {
            User rejector = rejectingMember.getUser();
            String rejectorName = rejector.getFullName() != null && !rejector.getFullName().isBlank()
                    ? rejector.getFullName().trim()
                    : "A teammate";
            notificationService.notify(
                    leader,
                    "TEAM_INVITE_REJECTED",
                    "Team invitation rejected",
                    rejectorName + " rejected your team invitation for " + programme.getTitle() + " programme.",
                    "TEAM_REGISTRATION",
                    team.getId());
        }
    }

    private ProgrammeRegistration prepareProgrammeRegistration(
            Programme programme,
            User user,
            String registrationType,
            TeamRegistration team) {
        return registrationRepository.findByProgrammeIdAndUserId(programme.getId(), user.getId())
                .map(existing -> {
                    if (OCCUPYING_STATUSES.contains(existing.getStatus())) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                "This student already has a registration or pending invitation for this programme.");
                    }
                    existing.setRegistrationType(registrationType);
                    existing.setTeamRegistration(team);
                    existing.setPaymentReference(null);
                    existing.setCustomResponsesJson(null);
                    return existing;
                })
                .orElseGet(() -> {
                    ProgrammeRegistration registration = new ProgrammeRegistration();
                    registration.setProgramme(programme);
                    registration.setUser(user);
                    registration.setRegistrationType(registrationType);
                    registration.setTeamRegistration(team);
                    return registration;
                });
    }

    private void evaluateTeamStatus(TeamRegistration team, Programme programme, Integer minSize) {
        if (TeamRegistrationStatus.CANCELLED.equals(team.getStatus())) {
            return;
        }

        List<TeamMember> members = teamMemberRepository.findByTeamRegistrationId(team.getId());
        Long leaderId = team.getLeader() != null ? team.getLeader().getId() : null;

        long invitedTeammates = members.stream()
                .filter(member -> leaderId == null || !leaderId.equals(member.getUser().getId()))
                .count();
        long acceptedTeammates = members.stream()
                .filter(member -> leaderId == null || !leaderId.equals(member.getUser().getId()))
                .filter(member -> InvitationStatus.ACCEPTED.equals(member.getInvitationStatus()))
                .count();
        long pendingTeammates = members.stream()
                .filter(member -> leaderId == null || !leaderId.equals(member.getUser().getId()))
                .filter(member -> InvitationStatus.PENDING.equals(member.getInvitationStatus()))
                .count();

        if (invitedTeammates == 0 || pendingTeammates > 0 || acceptedTeammates < invitedTeammates) {
            return;
        }

        long totalAccepted = members.stream()
                .filter(member -> InvitationStatus.ACCEPTED.equals(member.getInvitationStatus()))
                .count();
        int required = minSize != null ? minSize : 1;
        if (totalAccepted < required) {
            return;
        }

        team.setStatus(TeamRegistrationStatus.ACTIVE);
        teamRegistrationRepository.save(team);
        members.stream()
                .filter(member -> InvitationStatus.ACCEPTED.equals(member.getInvitationStatus()))
                .forEach(member -> {
                    if (member.getProgrammeRegistration() != null) {
                        ProgrammeRegistration reg = member.getProgrammeRegistration();
                        if (!RegistrationStatus.PENDING_PAYMENT_VERIFICATION.equals(reg.getStatus())
                                && !RegistrationStatus.PAYMENT_REJECTED.equals(reg.getStatus())) {
                            reg.setStatus(RegistrationStatus.ACTIVE);
                            registrationRepository.save(reg);
                            notifyRegistrationConfirmed(reg);
                        }
                    }
                });
    }

    private void ensureTeammateAvailable(Long programmeId, Long userId, Long currentTeamId) {
        registrationRepository.findByProgrammeIdAndUserId(programmeId, userId).ifPresent(registration -> {
            if (OCCUPYING_STATUSES.contains(registration.getStatus())) {
                if (RegistrationStatus.PENDING_INVITE.equals(registration.getStatus())
                        && registration.getTeamRegistration() != null
                        && currentTeamId.equals(registration.getTeamRegistration().getId())) {
                    return;
                }
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This student already has a registration or pending invitation for this programme.");
            }
        });

        List<TeamMember> memberships = teamMemberRepository.findOccupyingMemberships(programmeId, userId);
        if (memberships.isEmpty()) {
            return;
        }
        TeamMember earliest = memberships.get(0);
        if (currentTeamId != null && earliest.getTeamRegistration() != null
                && currentTeamId.equals(earliest.getTeamRegistration().getId())) {
            return;
        }
        String teamLabel = earliest.getTeamRegistration() != null
                ? earliest.getTeamRegistration().getTeamName()
                : "another team";
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "This student already has a pending or active team slot for this programme ("
                        + teamLabel + "). Only the earliest invitation is kept.");
    }

    private static String resolveTeammatePhone(String invitePhone, String lookupPhone, User teammate) {
        if (invitePhone != null && !invitePhone.isBlank()) {
            return invitePhone.trim();
        }
        if (lookupPhone != null && !lookupPhone.isBlank()) {
            return lookupPhone.trim();
        }
        if (teammate.getPhoneNumber() != null && !teammate.getPhoneNumber().isBlank()) {
            return teammate.getPhoneNumber().trim();
        }
        return invitePhone;
    }

    private void markNotificationRead(Long userId, Long teamMemberId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> "TEAM_MEMBER".equals(n.getReferenceType())
                        && teamMemberId.equals(n.getReferenceId()))
                .findFirst()
                .ifPresent(n -> {
                    n.setIsRead(true);
                    notificationRepository.save(n);
                });
    }

    private void ensureCapacityAvailable(Programme programme) {
        Integer max = programme.getExpectedParticipants();
        if (max == null || max <= 0) {
            return;
        }
        long occupied = registrationRepository.countByProgrammeIdAndStatusIn(
                programme.getId(), OCCUPYING_STATUSES);
        if (occupied >= max) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Registration is full. All participant slots have been taken.");
        }
    }

    private String validateAndSerializeCustomResponses(Programme programme, String customResponsesJson) {
        List<ProgrammeCustomFieldDto> fields = parseCustomFields(programme.getCustomRegistrationFieldsJson());
        if (fields.isEmpty()) {
            return null;
        }

        Map<String, String> responses = parseResponseMap(customResponsesJson);
        Map<String, String> normalized = new HashMap<>();

        for (ProgrammeCustomFieldDto field : fields) {
            String value = responses.getOrDefault(field.getId(), "").trim();
            if (field.isRequired() && value.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Please complete the required field: " + field.getLabel());
            }
            if (!value.isBlank()) {
                normalized.put(field.getId(), value);
            }
        }

        try {
            return normalized.isEmpty() ? null : objectMapper.writeValueAsString(normalized);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid custom field responses.", ex);
        }
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

    private Map<String, String> parseResponseMap(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid custom field responses format.");
        }
    }

    private Programme requireOpenProgramme(Long programmeId) {
        Programme programme = programmeRepository.findByIdWithOrganizer(programmeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme not found."));
        if (!WorkflowStatus.APPROVED.equals(programme.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Programme is not open for registration.");
        }
        LocalDate today = LocalDate.now();
        if (programme.getRegistrationOpenDate() != null && today.isBefore(programme.getRegistrationOpenDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration has not opened yet.");
        }
        if (programme.getRegistrationCloseDate() != null && today.isAfter(programme.getRegistrationCloseDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration has closed.");
        }
        return programme;
    }

    private void ensureNotRegistered(Long programmeId, Long userId) {
        registrationRepository.findByProgrammeIdAndUserId(programmeId, userId).ifPresent(registration -> {
            if (OCCUPYING_STATUSES.contains(registration.getStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "You are already registered for this programme.");
            }
        });
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private RegistrationResponseDto toDto(ProgrammeRegistration registration) {
        RegistrationResponseDto dto = new RegistrationResponseDto();
        dto.setId(registration.getId());
        dto.setProgrammeId(registration.getProgramme().getId());
        dto.setProgrammeTitle(registration.getProgramme().getTitle());
        dto.setProgrammeCategory(registration.getProgramme().getCategory());
        dto.setStatus(registration.getStatus());
        dto.setRegistrationType(registration.getRegistrationType());
        dto.setPaymentReference(registration.getPaymentReference());
        dto.setRegisteredAt(registration.getCreatedAt());
        if (registration.getUser() != null) {
            dto.setStudentFullName(registration.getUser().getFullName());
            dto.setMatricNumber(registration.getUser().getMatricNumber());
            dto.setFaculty(registration.getUser().getFaculty());
        }
        if (registration.getTeamRegistration() != null) {
            dto.setTeamName(registration.getTeamRegistration().getTeamName());
            dto.setTeamRegistrationId(registration.getTeamRegistration().getId());
        }
        paymentReceiptRepository.findByProgrammeRegistrationId(registration.getId()).ifPresent(receipt -> {
            dto.setPaymentReceiptUrl(FileUrlHelper.toPublicUrl(receipt.getFilePath()));
            paymentVerificationRepository.findByPaymentReceiptId(receipt.getId())
                    .ifPresent(v -> dto.setPaymentVerificationStatus(v.getStatus()));
        });

        Programme programme = registration.getProgramme();
        dto.setCustomRegistrationFields(parseCustomFields(programme.getCustomRegistrationFieldsJson()));
        dto.setCustomFieldResponses(parseResponseMap(registration.getCustomResponsesJson()));

        if (RegistrationStatus.ACTIVE.equals(registration.getStatus())
                && programme.getCommunicationLink() != null
                && !programme.getCommunicationLink().isBlank()) {
            dto.setCommunicationLink(programme.getCommunicationLink());
        }

        return dto;
    }

    private TeamRegistrationDetailDto toTeamDetailDto(TeamRegistration team) {
        TeamRegistrationDetailDto dto = new TeamRegistrationDetailDto();
        dto.setId(team.getId());
        dto.setProgrammeId(team.getProgramme().getId());
        dto.setProgrammeTitle(team.getProgramme().getTitle());
        dto.setTeamName(team.getTeamName());
        dto.setStatus(team.getStatus());
        dto.setMinTeamSize(team.getProgramme().getMinTeamSize());
        dto.setMaxTeamSize(team.getProgramme().getMaxTeamSize());

        List<TeamMember> members = teamMemberRepository.findByTeamRegistrationId(team.getId());
        dto.setAcceptedCount(members.stream().filter(m -> InvitationStatus.ACCEPTED.equals(m.getInvitationStatus())).count());
        dto.setPendingCount(members.stream().filter(m -> InvitationStatus.PENDING.equals(m.getInvitationStatus())).count());
        dto.setRejectedCount(members.stream().filter(m -> InvitationStatus.REJECTED.equals(m.getInvitationStatus())).count());
        dto.setMembers(members.stream().map(this::toMemberDto).collect(Collectors.toList()));
        return dto;
    }

    private TeamMemberResponseDto toMemberDto(TeamMember member) {
        TeamMemberResponseDto dto = new TeamMemberResponseDto();
        dto.setId(member.getId());
        dto.setMatricNumber(member.getMatricNumber());
        dto.setPhoneNumber(member.getPhoneNumber());
        dto.setInvitationStatus(member.getInvitationStatus());
        dto.setRespondedAt(member.getRespondedAt());
        if (member.getUser() != null) {
            dto.setFullName(member.getUser().getFullName());
        }
        return dto;
    }

    private void notifyRegistrationConfirmed(ProgrammeRegistration registration) {
        if (registration.getUser() == null || registration.getProgramme() == null) {
            return;
        }
        notificationService.notify(
                registration.getUser(),
                "REGISTRATION_CONFIRMED",
                "Registration confirmed",
                "Your registration for \"" + registration.getProgramme().getTitle() + "\" is now active.",
                "REGISTRATION",
                registration.getId()
        );
    }
}
