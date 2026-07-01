package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findFirstByProgramme_IdAndSessionStatusInOrderByStartedAtDesc(
            Long programmeId, Collection<String> statuses);

    List<AttendanceSession> findBySessionStatusAndProgramme_IdIn(String sessionStatus, Collection<Long> programmeIds);
}
