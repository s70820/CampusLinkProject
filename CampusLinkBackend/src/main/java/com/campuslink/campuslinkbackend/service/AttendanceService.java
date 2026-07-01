package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.RegistrationStatus;
import com.campuslink.campuslinkbackend.dto.AttendanceCheckInResultDto;
import com.campuslink.campuslinkbackend.dto.AttendanceSessionStateDto;
import com.campuslink.campuslinkbackend.dto.StudentAttendanceDto;
import com.campuslink.campuslinkbackend.entity.AttendanceSession;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.ProgrammeAttendance;
import com.campuslink.campuslinkbackend.entity.ProgrammeRegistration;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.AttendanceSessionRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeAttendanceRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRegistrationRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.util.OrganizerProgrammePolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    public static final String SESSION_ACTIVE = "ACTIVE";
    public static final String SESSION_PAUSED = "PAUSED";
    public static final String SESSION_ENDED = "ENDED";
    public static final String QR_PREFIX = "campuslink:attendance:";
    private static final int TOKEN_WINDOW_SECONDS = 30;
    private static final DateTimeFormatter SESSION_LABEL_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy · HH:mm", Locale.ENGLISH);

    private final AttendanceSessionRepository sessionRepository;
    private final ProgrammeAttendanceRepository attendanceRepository;
    private final ProgrammeRepository programmeRepository;
    private final ProgrammeRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AttendanceService(
            AttendanceSessionRepository sessionRepository,
            ProgrammeAttendanceRepository attendanceRepository,
            ProgrammeRepository programmeRepository,
            ProgrammeRegistrationRepository registrationRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.sessionRepository = sessionRepository;
        this.attendanceRepository = attendanceRepository;
        this.programmeRepository = programmeRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public AttendanceSessionStateDto startSession(Long organizerId, Long programmeId) {
        Programme programme = requireOwnedProgramme(organizerId, programmeId);
        endOpenSessions(programmeId);

        AttendanceSession session = new AttendanceSession();
        session.setProgramme(programme);
        session.setOrganizer(requireUser(organizerId));
        session.setSessionSecret(UUID.randomUUID().toString().replace("-", ""));
        session.setSessionLabel(LocalDateTime.now().format(SESSION_LABEL_FORMAT));
        session.setSessionStatus(SESSION_ACTIVE);
        session.setStartedAt(LocalDateTime.now());
        session = sessionRepository.save(session);
        return toSessionState(session);
    }

    @Transactional
    public AttendanceSessionStateDto pauseSession(Long organizerId, Long programmeId) {
        AttendanceSession session = requireMutableSession(organizerId, programmeId);
        session.setSessionStatus(SESSION_PAUSED);
        sessionRepository.save(session);
        return toSessionState(session);
    }

    @Transactional
    public AttendanceSessionStateDto resumeSession(Long organizerId, Long programmeId) {
        AttendanceSession session = requireOwnedOpenSession(organizerId, programmeId);
        if (!SESSION_PAUSED.equals(session.getSessionStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only paused sessions can be resumed.");
        }
        session.setSessionStatus(SESSION_ACTIVE);
        sessionRepository.save(session);
        return toSessionState(session);
    }

    @Transactional
    public AttendanceSessionStateDto endSession(Long organizerId, Long programmeId) {
        AttendanceSession session = requireOwnedOpenSession(organizerId, programmeId);
        session.setSessionStatus(SESSION_ENDED);
        session.setEndedAt(LocalDateTime.now());
        sessionRepository.save(session);
        return toSessionState(session);
    }

    public AttendanceSessionStateDto getCurrentSession(Long organizerId, Long programmeId) {
        requireOwnedProgramme(organizerId, programmeId);
        return sessionRepository
                .findFirstByProgramme_IdAndSessionStatusInOrderByStartedAtDesc(
                        programmeId, List.of(SESSION_ACTIVE, SESSION_PAUSED))
                .map(this::toSessionState)
                .orElse(null);
    }

    public List<AttendanceSessionStateDto> getActiveSessionsForStudent(Long userId) {
        requireUser(userId);
        Set<Long> programmeIds = registrationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(reg -> RegistrationStatus.ACTIVE.equals(reg.getStatus()))
                .map(reg -> reg.getProgramme().getId())
                .collect(Collectors.toSet());
        if (programmeIds.isEmpty()) {
            return List.of();
        }
        return sessionRepository.findBySessionStatusAndProgramme_IdIn(SESSION_ACTIVE, programmeIds).stream()
                .map(this::toSessionState)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceCheckInResultDto checkIn(Long userId, String qrPayload) {
        requireUser(userId);
        if (qrPayload == null || qrPayload.isBlank()) {
            return AttendanceCheckInResultDto.failure("QR code payload is empty.");
        }

        ParsedQr parsed = parseQrPayload(qrPayload.trim());
        if (parsed == null) {
            return AttendanceCheckInResultDto.failure("Invalid attendance QR code.");
        }

        AttendanceSession session = sessionRepository
                .findFirstByProgramme_IdAndSessionStatusInOrderByStartedAtDesc(
                        parsed.programmeId, List.of(SESSION_ACTIVE))
                .orElse(null);
        if (session == null) {
            return AttendanceCheckInResultDto.failure("No live attendance session is open for this programme.");
        }
        if (!isTokenValid(parsed.programmeId, parsed.token, session.getSessionSecret())) {
            return AttendanceCheckInResultDto.failure("QR code has expired. Ask the organiser to display a fresh code.");
        }

        ProgrammeRegistration registration = registrationRepository
                .findByProgrammeIdAndUserId(parsed.programmeId, userId)
                .orElse(null);
        if (registration == null || !RegistrationStatus.ACTIVE.equals(registration.getStatus())) {
            return AttendanceCheckInResultDto.failure("You must have an active registration for this programme.");
        }

        if (attendanceRepository.existsByAttendanceSession_IdAndUser_Id(session.getId(), userId)) {
            return AttendanceCheckInResultDto.failure("You have already checked in for this session.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        Programme programme = session.getProgramme();

        ProgrammeAttendance attendance = new ProgrammeAttendance();
        attendance.setProgramme(programme);
        attendance.setUser(user);
        attendance.setSessionLabel(session.getSessionLabel());
        attendance.setAttendanceStatus("PRESENT");
        attendance.setCheckedInAt(LocalDateTime.now());
        attendance.setAttendanceSession(session);
        attendance = attendanceRepository.save(attendance);

        notificationService.notify(
                user,
                "ATTENDANCE_CHECKIN",
                "Attendance recorded",
                "You checked in to \"" + programme.getTitle() + "\" (" + session.getSessionLabel() + ").",
                "ATTENDANCE",
                attendance.getId()
        );

        return AttendanceCheckInResultDto.success(
                "Check-in successful for " + programme.getTitle() + ".",
                toAttendanceDto(attendance)
        );
    }

    private void endOpenSessions(Long programmeId) {
        sessionRepository.findFirstByProgramme_IdAndSessionStatusInOrderByStartedAtDesc(
                        programmeId, List.of(SESSION_ACTIVE, SESSION_PAUSED))
                .ifPresent(session -> {
                    session.setSessionStatus(SESSION_ENDED);
                    session.setEndedAt(LocalDateTime.now());
                    sessionRepository.save(session);
                });
    }

    private AttendanceSession requireMutableSession(Long organizerId, Long programmeId) {
        AttendanceSession session = requireOwnedOpenSession(organizerId, programmeId);
        if (SESSION_ENDED.equals(session.getSessionStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This attendance session has already ended.");
        }
        return session;
    }

    private AttendanceSession requireOwnedOpenSession(Long organizerId, Long programmeId) {
        Programme programme = requireOwnedProgramme(organizerId, programmeId);
        return sessionRepository
                .findFirstByProgramme_IdAndSessionStatusInOrderByStartedAtDesc(
                        programmeId, List.of(SESSION_ACTIVE, SESSION_PAUSED))
                .filter(session -> programme.getOrganizer() != null
                        && organizerId.equals(programme.getOrganizer().getId()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No attendance session found for this programme."));
    }

    private Programme requireOwnedProgramme(Long organizerId, Long programmeId) {
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme not found."));
        if (programme.getOrganizer() == null || !organizerId.equals(programme.getOrganizer().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage attendance for your own programmes.");
        }
        if (!OrganizerProgrammePolicy.isOperational(programme)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Attendance sessions can only be run for approved programmes.");
        }
        return programme;
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private AttendanceSessionStateDto toSessionState(AttendanceSession session) {
        long epoch = currentEpoch();
        String token = buildToken(session.getProgramme().getId(), epoch, session.getSessionSecret());
        String qrPayload = QR_PREFIX + session.getProgramme().getId() + ":" + token;

        AttendanceSessionStateDto dto = new AttendanceSessionStateDto();
        dto.setSessionId(session.getId());
        dto.setProgrammeId(session.getProgramme().getId());
        dto.setProgrammeTitle(session.getProgramme().getTitle());
        dto.setStatus(session.getSessionStatus());
        dto.setSessionLabel(session.getSessionLabel());
        dto.setToken(token);
        dto.setQrPayload(qrPayload);
        dto.setCountdownSeconds(countdownSeconds());
        dto.setCheckedInCount(attendanceRepository.countByAttendanceSession_Id(session.getId()));
        return dto;
    }

    private StudentAttendanceDto toAttendanceDto(ProgrammeAttendance attendance) {
        StudentAttendanceDto dto = new StudentAttendanceDto();
        dto.setId(attendance.getId());
        dto.setProgrammeId(attendance.getProgramme().getId());
        dto.setProgrammeTitle(attendance.getProgramme().getTitle());
        dto.setSessionLabel(attendance.getSessionLabel());
        dto.setAttendanceStatus(attendance.getAttendanceStatus());
        dto.setCheckedInAt(attendance.getCheckedInAt());
        return dto;
    }

    static long currentEpoch() {
        return Math.floorDiv(System.currentTimeMillis(), TOKEN_WINDOW_SECONDS * 1000L);
    }

    static int countdownSeconds() {
        long seconds = System.currentTimeMillis() / 1000L;
        return TOKEN_WINDOW_SECONDS - (int) (seconds % TOKEN_WINDOW_SECONDS);
    }

    static String buildToken(Long programmeId, long epoch, String secret) {
        String raw = programmeId + "|" + epoch + "|" + secret;
        String encoded = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8))
                .replaceAll("=+$", "");
        int start = Math.max(0, encoded.length() - 20);
        return encoded.substring(start).toUpperCase(Locale.ROOT);
    }

    static boolean isTokenValid(Long programmeId, String token, String secret) {
        if (token == null || token.isBlank()) {
            return false;
        }
        long epoch = currentEpoch();
        String normalized = token.trim().toUpperCase(Locale.ROOT);
        return buildToken(programmeId, epoch, secret).equals(normalized)
                || buildToken(programmeId, epoch - 1, secret).equals(normalized);
    }

    private static ParsedQr parseQrPayload(String payload) {
        if (!payload.startsWith(QR_PREFIX)) {
            return null;
        }
        String remainder = payload.substring(QR_PREFIX.length());
        int separator = remainder.indexOf(':');
        if (separator <= 0 || separator >= remainder.length() - 1) {
            return null;
        }
        try {
            long programmeId = Long.parseLong(remainder.substring(0, separator));
            String token = remainder.substring(separator + 1);
            return new ParsedQr(programmeId, token);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static final class ParsedQr {
        private final Long programmeId;
        private final String token;

        private ParsedQr(Long programmeId, String token) {
            this.programmeId = programmeId;
            this.token = token;
        }
    }
}
