package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeamRegistrationId(Long teamRegistrationId);
    long countByTeamRegistrationIdAndInvitationStatus(Long teamRegistrationId, String status);
    Optional<TeamMember> findByIdAndUserId(Long id, Long userId);

    @Query("""
            SELECT tm FROM TeamMember tm
            JOIN tm.teamRegistration tr
            WHERE tr.programme.id = :programmeId
              AND tm.user.id = :userId
              AND tm.invitationStatus IN ('PENDING', 'ACCEPTED')
              AND tr.status <> 'CANCELLED'
            ORDER BY tm.createdAt ASC
            """)
    List<TeamMember> findOccupyingMemberships(
            @Param("programmeId") Long programmeId,
            @Param("userId") Long userId);
}
