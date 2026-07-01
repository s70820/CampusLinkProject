package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.AdvisorApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdvisorApprovalRepository extends JpaRepository<AdvisorApproval, Long> {
    Optional<AdvisorApproval> findByProgrammeId(Long programmeId);
    Optional<AdvisorApproval> findByApprovalToken(String approvalToken);
}
