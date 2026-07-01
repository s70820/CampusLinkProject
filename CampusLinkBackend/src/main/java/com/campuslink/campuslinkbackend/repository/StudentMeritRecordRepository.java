package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.StudentMeritRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentMeritRecordRepository extends JpaRepository<StudentMeritRecord, Long> {
    List<StudentMeritRecord> findByUserIdOrderByAwardedAtDesc(Long userId);

    @Query("SELECT m FROM StudentMeritRecord m JOIN FETCH m.programme WHERE m.user.id = :userId ORDER BY m.awardedAt DESC")
    List<StudentMeritRecord> findByUserIdWithProgrammeOrderByAwardedAtDesc(@Param("userId") Long userId);

    boolean existsByUser_IdAndProgramme_IdAndMeritRoleType(Long userId, Long programmeId, String meritRoleType);
}
