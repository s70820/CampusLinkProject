package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.CommitteeRole;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ProgrammeCommitteeRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@Service
public class ProgrammeRegistrationEligibilityService {

    private static final List<String> BLOCKED_COMMITTEE_ROLES = Arrays.asList(
            CommitteeRole.PENGARAH_PROGRAM,
            CommitteeRole.MT_PROGRAM,
            CommitteeRole.AJK_PROGRAM,
            CommitteeRole.SPECIAL_CONTRIBUTION
    );

    private final ProgrammeCommitteeRepository committeeRepository;
    private final ProgrammeRepository programmeRepository;

    public ProgrammeRegistrationEligibilityService(
            ProgrammeCommitteeRepository committeeRepository,
            ProgrammeRepository programmeRepository) {
        this.committeeRepository = committeeRepository;
        this.programmeRepository = programmeRepository;
    }

    public boolean isEligibleToRegisterAsParticipant(Programme programme, User user) {
        return getRestrictionReason(programme, user) == null;
    }

    public String getRestrictionReason(Programme programme, User user) {
        if (programme == null || user == null) {
            return null;
        }

        if (isProgrammeOrganizer(programme, user)) {
            return "As the programme organizer, you cannot register as a participant for this programme.";
        }

        String matric = normalizeMatric(user.getMatricNumber());
        if (matric != null && isMatricBlocked(programme.getId(), matric)) {
            return "Students listed as Programme Director, MT, AJK, or Special Contribution for this programme cannot register as participants.";
        }

        return null;
    }

    public String getMatricRestrictionReason(Programme programme, String matricNumber) {
        if (programme == null) {
            return null;
        }

        String matric = normalizeMatric(matricNumber);
        if (matric == null) {
            return null;
        }

        if (isProgrammeOrganizer(programme, matric)) {
            return "The programme organizer cannot register as a participant for this programme.";
        }

        if (isMatricBlocked(programme.getId(), matric)) {
            return "Student " + matric
                    + " is listed as Programme Director, MT, AJK, or Special Contribution for this programme and cannot register as a participant.";
        }

        return null;
    }

    public void ensureEligibleParticipant(Programme programme, User user) {
        String reason = getRestrictionReason(programme, user);
        if (reason != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
        }
    }

    public void ensureMatricEligible(Programme programme, String matricNumber) {
        String reason = getMatricRestrictionReason(programme, matricNumber);
        if (reason != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
        }
    }

    private boolean isMatricBlocked(Long programmeId, String matric) {
        return committeeRepository.existsByProgrammeIdAndMatricNumberIgnoreCaseAndCommitteeRoleIn(
                programmeId, matric, BLOCKED_COMMITTEE_ROLES);
    }

    private boolean isProgrammeOrganizer(Programme programme, User user) {
        if (programme == null || user == null || user.getId() == null) {
            return false;
        }
        if (programme.getOrganizer() != null
                && programme.getOrganizer().getId() != null
                && programme.getOrganizer().getId().equals(user.getId())) {
            return true;
        }
        return programmeRepository.existsByIdAndOrganizer_Id(programme.getId(), user.getId());
    }

    private boolean isProgrammeOrganizer(Programme programme, String matric) {
        if (programme == null || matric == null) {
            return false;
        }
        if (programme.getOrganizer() != null) {
            String organizerMatric = normalizeMatric(programme.getOrganizer().getMatricNumber());
            if (matric.equals(organizerMatric)) {
                return true;
            }
        }
        return programmeRepository.findOrganizerMatricNumberByProgrammeId(programme.getId())
                .map(this::normalizeMatric)
                .map(matric::equals)
                .orElse(false);
    }

    private String normalizeMatric(String matricNumber) {
        if (matricNumber == null || matricNumber.isBlank()) {
            return null;
        }
        return matricNumber.trim().toUpperCase();
    }
}
