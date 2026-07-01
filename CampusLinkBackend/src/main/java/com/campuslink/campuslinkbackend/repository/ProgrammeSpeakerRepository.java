package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.ProgrammeSpeaker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgrammeSpeakerRepository extends JpaRepository<ProgrammeSpeaker, Long> {
    List<ProgrammeSpeaker> findByProgrammeIdOrderBySortOrderAsc(Long programmeId);
    void deleteByProgrammeId(Long programmeId);
}
