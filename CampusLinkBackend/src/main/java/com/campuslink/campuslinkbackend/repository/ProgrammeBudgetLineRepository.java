package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.ProgrammeBudgetLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgrammeBudgetLineRepository extends JpaRepository<ProgrammeBudgetLine, Long> {
    List<ProgrammeBudgetLine> findByProgrammeIdOrderBySortOrderAsc(Long programmeId);
    void deleteByProgrammeId(Long programmeId);
}
