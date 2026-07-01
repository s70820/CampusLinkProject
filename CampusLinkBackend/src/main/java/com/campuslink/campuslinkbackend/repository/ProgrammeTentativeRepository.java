package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.ProgrammeTentative;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgrammeTentativeRepository extends JpaRepository<ProgrammeTentative, Long> {
    List<ProgrammeTentative> findByProgrammeIdOrderBySortOrderAsc(Long programmeId);
    void deleteByProgrammeId(Long programmeId);
}
