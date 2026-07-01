package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.WorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowHistoryRepository extends JpaRepository<WorkflowHistory, Long> {
    List<WorkflowHistory> findByProgrammeIdOrderByCreatedAtDesc(Long programmeId);
}
