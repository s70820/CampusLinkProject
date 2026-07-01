package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.MeritRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeritRuleRepository extends JpaRepository<MeritRule, Long> {
    List<MeritRule> findByProgrammeLevel(String programmeLevel);
    Optional<MeritRule> findByProgrammeLevelAndRoleType(String programmeLevel, String roleType);
}
