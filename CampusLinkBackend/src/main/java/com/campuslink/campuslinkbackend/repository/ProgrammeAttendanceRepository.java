package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.ProgrammeAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgrammeAttendanceRepository extends JpaRepository<ProgrammeAttendance, Long> {
    List<ProgrammeAttendance> findByUserIdOrderByCheckedInAtDesc(Long userId);
    List<ProgrammeAttendance> findByProgramme_IdOrderByCheckedInAtDesc(Long programmeId);
    List<ProgrammeAttendance> findByProgramme_IdAndAttendanceStatus(Long programmeId, String attendanceStatus);
    boolean existsByProgramme_IdAndUser_IdAndAttendanceStatus(Long programmeId, Long userId, String attendanceStatus);
    boolean existsByAttendanceSession_IdAndUser_Id(Long attendanceSessionId, Long userId);
    long countByAttendanceSession_Id(Long attendanceSessionId);
    long countByUserIdAndAttendanceStatus(Long userId, String attendanceStatus);
}
