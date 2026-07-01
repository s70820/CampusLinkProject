package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.MeritPolicy;
import com.campuslink.campuslinkbackend.constants.MeritRoleType;
import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.entity.Programme;
import com.campuslink.campuslinkbackend.entity.ProgrammeAttendance;
import com.campuslink.campuslinkbackend.entity.ProgrammeCommittee;
import com.campuslink.campuslinkbackend.entity.StudentMeritRecord;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.ProgrammeAttendanceRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeCommitteeRepository;
import com.campuslink.campuslinkbackend.repository.ProgrammeRepository;
import com.campuslink.campuslinkbackend.repository.StudentMeritRecordRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class MeritAwardService {

    private static final Logger log = LoggerFactory.getLogger(MeritAwardService.class);
    private static final String PRESENT = "PRESENT";
    private static final List<String> ELIGIBLE_PROGRAMME_STATUSES = Arrays.asList(
            WorkflowStatus.APPROVED,
            WorkflowStatus.COMPLETED
    );

    private final StudentMeritRecordRepository meritRecordRepository;
    private final ProgrammeCommitteeRepository committeeRepository;
    private final ProgrammeAttendanceRepository attendanceRepository;
    private final ProgrammeRepository programmeRepository;
    private final UserRepository userRepository;
    private final MeritRuleService meritRuleService;
    private final NotificationService notificationService;

    public MeritAwardService(
            StudentMeritRecordRepository meritRecordRepository,
            ProgrammeCommitteeRepository committeeRepository,
            ProgrammeAttendanceRepository attendanceRepository,
            ProgrammeRepository programmeRepository,
            UserRepository userRepository,
            MeritRuleService meritRuleService,
            NotificationService notificationService) {
        this.meritRecordRepository = meritRecordRepository;
        this.committeeRepository = committeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.programmeRepository = programmeRepository;
        this.userRepository = userRepository;
        this.meritRuleService = meritRuleService;
        this.notificationService = notificationService;
    }

    public boolean isMeritAwardDue(Programme programme) {
        if (programme == null || programme.getEndDate() == null) {
            return false;
        }
        String status = programme.getStatus();
        if (status == null || !ELIGIBLE_PROGRAMME_STATUSES.contains(status)) {
            return false;
        }
        LocalDate awardDate = programme.getEndDate().plusDays(MeritPolicy.AWARD_DELAY_DAYS);
        return !LocalDate.now().isBefore(awardDate);
    }

    @Transactional
    public int processDueMeritAwards() {
        LocalDate latestEligibleEndDate = LocalDate.now().minusDays(MeritPolicy.AWARD_DELAY_DAYS);
        List<Programme> programmes = programmeRepository.findByStatusInAndEndDateLessThanEqual(
                ELIGIBLE_PROGRAMME_STATUSES, latestEligibleEndDate);

        int processed = 0;
        for (Programme programme : programmes) {
            if (awardProgrammeMerit(programme)) {
                processed++;
            }
        }
        if (processed > 0) {
            log.info("Awarded deferred merit for {} programme(s)", processed);
        }
        return processed;
    }

    @Transactional
    public boolean awardProgrammeMerit(Programme programme) {
        if (!isMeritAwardDue(programme)) {
            return false;
        }

        int created = 0;
        created += awardCommitteeMerit(programme);
        created += awardParticipantMeritForAttendees(programme);

        if (created > 0) {
            log.info("Created {} merit record(s) for programme {} ({})",
                    created, programme.getId(), programme.getTitle());
        }
        return created > 0;
    }

    private int awardCommitteeMerit(Programme programme) {
        int created = 0;
        List<ProgrammeCommittee> committeeMembers = committeeRepository.findByProgrammeId(programme.getId());
        for (ProgrammeCommittee member : committeeMembers) {
            if (member.getStudent() == null) {
                continue;
            }
            String meritRoleType = member.getMeritRoleType() != null
                    ? member.getMeritRoleType()
                    : MeritRoleType.AJK;
            int points = member.getMeritPoints() != null && member.getMeritPoints() > 0
                    ? member.getMeritPoints()
                    : meritRuleService.getMeritPoints(programme.getProgrammeLevel(), meritRoleType);
            String roleLabel = resolveRoleLabel(member);
            if (createMeritRecordIfAbsent(
                    member.getStudent(),
                    programme,
                    meritRoleType,
                    roleLabel,
                    points)) {
                created++;
            }
        }
        return created;
    }

    private int awardParticipantMeritForAttendees(Programme programme) {
        int created = 0;
        Set<Long> userIds = new LinkedHashSet<>();
        for (ProgrammeAttendance attendance : attendanceRepository
                .findByProgramme_IdAndAttendanceStatus(programme.getId(), PRESENT)) {
            if (attendance.getUser() != null && attendance.getUser().getId() != null) {
                userIds.add(attendance.getUser().getId());
            }
        }

        for (Long userId : userIds) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                continue;
            }
            int points = programme.getMeritPoints() != null && programme.getMeritPoints() > 0
                    ? programme.getMeritPoints()
                    : meritRuleService.getMeritPoints(programme.getProgrammeLevel(), MeritRoleType.PARTICIPANT);
            if (createMeritRecordIfAbsent(user, programme, MeritRoleType.PARTICIPANT, "Participant", points)) {
                created++;
            }
        }
        return created;
    }

    private boolean createMeritRecordIfAbsent(
            User user,
            Programme programme,
            String meritRoleType,
            String roleLabel,
            int points) {
        if (points <= 0) {
            return false;
        }
        if (meritRecordRepository.existsByUser_IdAndProgramme_IdAndMeritRoleType(
                user.getId(), programme.getId(), meritRoleType)) {
            return false;
        }

        LocalDate awardedAt = LocalDate.now();
        StudentMeritRecord record = new StudentMeritRecord();
        record.setUser(user);
        record.setProgramme(programme);
        record.setProgrammeTitle(programme.getTitle());
        record.setProgrammeLevel(programme.getProgrammeLevel());
        record.setMeritRoleType(meritRoleType);
        record.setRoleLabel(roleLabel);
        record.setMeritPoints(points);
        record.setAcademicYear(String.valueOf(awardedAt.getYear()));
        record.setSemester(awardedAt.getMonthValue() <= 6 ? "Semester 1" : "Semester 2");
        record.setStatus("COMPLETED");
        record.setAwardedAt(awardedAt);
        meritRecordRepository.save(record);

        notificationService.notify(
                user,
                "MERIT_AWARDED",
                "Merit points awarded",
                "You received " + points + " merit points for \""
                        + programme.getTitle() + "\" (" + roleLabel + ").",
                "MERIT",
                record.getId()
        );
        return true;
    }

    private String resolveRoleLabel(ProgrammeCommittee member) {
        if (member.getContributionDescription() != null && !member.getContributionDescription().isBlank()) {
            return "Special Contribution — " + member.getContributionDescription();
        }
        if (member.getPositionLabel() != null && !member.getPositionLabel().isBlank()) {
            return member.getPositionLabel();
        }
        return member.getCommitteeRole() != null ? member.getCommitteeRole() : "Committee";
    }
}
