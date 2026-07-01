package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.ProgrammeRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProgrammeRegistrationRepository extends JpaRepository<ProgrammeRegistration, Long> {
    List<ProgrammeRegistration> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ProgrammeRegistration> findByProgrammeIdOrderByCreatedAtDesc(Long programmeId);
    Optional<ProgrammeRegistration> findByProgrammeIdAndUserId(Long programmeId, Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
    long countByProgrammeIdAndStatusIn(Long programmeId, Collection<String> statuses);
}
