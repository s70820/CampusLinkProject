package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.RoleRequestHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleRequestHistoryRepository extends JpaRepository<RoleRequestHistory, Long> {
    List<RoleRequestHistory> findByRoleRequestIdOrderByCreatedAtAsc(Long roleRequestId);
}
