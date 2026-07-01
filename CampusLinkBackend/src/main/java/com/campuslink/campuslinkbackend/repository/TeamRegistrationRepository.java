package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.TeamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamRegistrationRepository extends JpaRepository<TeamRegistration, Long> {
    List<TeamRegistration> findByLeader_IdOrderByCreatedAtDesc(Long leaderId);
    Optional<TeamRegistration> findByProgrammeIdAndLeader_Id(Long programmeId, Long leaderId);
}
