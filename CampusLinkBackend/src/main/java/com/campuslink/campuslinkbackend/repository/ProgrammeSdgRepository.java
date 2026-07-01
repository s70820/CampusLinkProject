package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.ProgrammeSdg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProgrammeSdgRepository extends JpaRepository<ProgrammeSdg, Long> {
    List<ProgrammeSdg> findByProgrammeId(Long programmeId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from ProgrammeSdg ps where ps.programme.id = :programmeId")
    void deleteByProgrammeId(@Param("programmeId") Long programmeId);
}
