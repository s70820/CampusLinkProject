package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.ProgrammeCommittee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProgrammeCommitteeRepository extends JpaRepository<ProgrammeCommittee, Long> {
    List<ProgrammeCommittee> findByProgrammeId(Long programmeId);

    boolean existsByProgrammeIdAndMatricNumberIgnoreCaseAndCommitteeRoleIn(
            Long programmeId, String matricNumber, List<String> committeeRoles);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from ProgrammeCommittee pc where pc.programme.id = :programmeId")
    void deleteByProgrammeId(@Param("programmeId") Long programmeId);
}
