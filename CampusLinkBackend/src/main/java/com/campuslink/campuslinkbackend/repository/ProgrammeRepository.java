/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.Programme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProgrammeRepository extends JpaRepository<Programme, Long> {

    List<Programme> findByStatus(String status);

    List<Programme> findByStatusIn(List<String> statuses);

    List<Programme> findByStatusInAndUpdatedAtBefore(List<String> statuses, LocalDateTime cutoff);

    List<Programme> findByStatusAndUpdatedAtBeforeAndUpdatedAtAfterAndDraftExpiryWarningSentAtIsNull(
            String status, LocalDateTime updatedBefore, LocalDateTime updatedAfter);

    List<Programme> findByStatusAndArchivedAtBefore(String status, LocalDateTime cutoff);

    List<Programme> findByOrganizer_IdOrderByStartDateDesc(Long organizerId);

    long countByOrganizer_Id(Long organizerId);

    long countByOrganizer_IdAndStatus(Long organizerId, String status);

    List<Programme> findByStatusInAndEndDateLessThanEqual(List<String> statuses, LocalDate endDate);

    boolean existsByIdAndOrganizer_Id(Long programmeId, Long organizerId);

    @Query("SELECT p FROM Programme p LEFT JOIN FETCH p.organizer WHERE p.id = :id")
    Optional<Programme> findByIdWithOrganizer(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Programme p LEFT JOIN FETCH p.organizer WHERE p.status = :status")
    List<Programme> findByStatusWithOrganizer(@Param("status") String status);

    @Query("SELECT o.matricNumber FROM Programme p JOIN p.organizer o WHERE p.id = :programmeId")
    Optional<String> findOrganizerMatricNumberByProgrammeId(@Param("programmeId") Long programmeId);
}