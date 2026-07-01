package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.RegistrationStatus;
import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.ProgrammeRegistration;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.entity.WorkflowHistory;
import com.campuslink.campuslinkbackend.repository.ProgrammeRegistrationRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.repository.WorkflowHistoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class ProgrammeCancellationService {

    private static final List<String> CANCELLABLE_REGISTRATION_STATUSES = Arrays.asList(
            RegistrationStatus.ACTIVE,
            RegistrationStatus.PENDING_PAYMENT,
            RegistrationStatus.PENDING_PAYMENT_VERIFICATION,
            RegistrationStatus.PENDING_TEAM,
            RegistrationStatus.PENDING_INVITE,
            RegistrationStatus.PAYMENT_APPROVED
    );

    private final ProgrammeRepository programmeRepository;
    private final ProgrammeRegistrationRepository registrationRepository;
    private final WorkflowHistoryRepository workflowHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ProgrammeCancellationService(
            ProgrammeRepository programmeRepository,
            ProgrammeRegistrationRepository registrationRepository,
            WorkflowHistoryRepository workflowHistoryRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.programmeRepository = programmeRepository;
        this.registrationRepository = registrationRepository;
        this.workflowHistoryRepository = workflowHistoryRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Programme cancelPublishedProgramme(Long programmeId, Long actorId, String reason) {
        User actor = requireActor(actorId);
        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancellation reason is required.");
        }

        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme not found."));

        if (!WorkflowStatus.APPROVED.equalsIgnoreCase(programme.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only approved programmes published to the student portal can be cancelled.");
        }

        String fromStatus = programme.getStatus();
        programme.setStatus(WorkflowStatus.CANCELLED);
        programme.setHepaRemarks(reason.trim());
        programme = programmeRepository.save(programme);

        recordHistory(programme, fromStatus, WorkflowStatus.CANCELLED, "CANCEL_PUBLISHED", actor.getId(), reason.trim());
        cancelActiveRegistrations(programme, reason.trim());
        notifyOrganizer(programme, reason.trim());
        notifyRegisteredStudents(programme, reason.trim());

        return programme;
    }

    private void cancelActiveRegistrations(Programme programme, String reason) {
        List<ProgrammeRegistration> registrations =
                registrationRepository.findByProgrammeIdOrderByCreatedAtDesc(programme.getId());
        for (ProgrammeRegistration registration : registrations) {
            if (!CANCELLABLE_REGISTRATION_STATUSES.contains(registration.getStatus())) {
                continue;
            }
            registration.setStatus(RegistrationStatus.CANCELLED);
            registrationRepository.save(registration);
        }
    }

    private void notifyOrganizer(Programme programme, String reason) {
        if (programme.getOrganizer() == null) {
            return;
        }
        notificationService.notify(
                programme.getOrganizer(),
                "PROGRAMME_CANCELLED",
                "Programme cancelled",
                "Your programme \"" + programme.getTitle()
                        + "\" has been withdrawn from the student portal. Reason: " + reason,
                "PROGRAMME",
                programme.getId()
        );
    }

    private void notifyRegisteredStudents(Programme programme, String reason) {
        List<ProgrammeRegistration> registrations =
                registrationRepository.findByProgrammeIdOrderByCreatedAtDesc(programme.getId());
        for (ProgrammeRegistration registration : registrations) {
            if (registration.getUser() == null) {
                continue;
            }
            notificationService.notify(
                    registration.getUser(),
                    "PROGRAMME_CANCELLED",
                    "Programme cancelled",
                    "Registration for \"" + programme.getTitle()
                            + "\" has been cancelled. Reason: " + reason,
                    "REGISTRATION",
                    registration.getId()
            );
        }
    }

    private User requireActor(Long actorId) {
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        String role = actor.getRole() != null ? actor.getRole().toUpperCase(Locale.ROOT) : "";
        if (!"MPP".equals(role) && !"HEPA".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only MPP and HEPA administrators can cancel published programmes.");
        }
        return actor;
    }

    private void recordHistory(
            Programme programme,
            String fromStatus,
            String toStatus,
            String action,
            Long performedBy,
            String remarks) {
        WorkflowHistory history = new WorkflowHistory();
        history.setProgramme(programme);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setAction(action);
        history.setPerformedBy(performedBy);
        history.setRemarks(remarks);
        workflowHistoryRepository.save(history);
    }
}
