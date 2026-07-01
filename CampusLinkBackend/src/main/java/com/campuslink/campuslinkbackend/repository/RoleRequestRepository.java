package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.RoleRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {
    List<RoleRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<RoleRequest> findAllByOrderByCreatedAtDesc();
    List<RoleRequest> findByStatusOrderByCreatedAtDesc(String status);
    Optional<RoleRequest> findByUserIdAndStatus(Long userId, String status);
    Optional<RoleRequest> findFirstByUserIdAndStatusOrderByReviewedAtDesc(Long userId, String status);
    Optional<RoleRequest> findFirstByUserIdAndRequestedRoleIgnoreCaseAndStatusOrderByReviewedAtDesc(
            Long userId, String requestedRole, String status);
    boolean existsByUserIdAndStatus(Long userId, String status);
    boolean existsByClubIdAndRequestedRoleIgnoreCaseAndStatus(Long clubId, String requestedRole, String status);
    boolean existsByClubIdAndRequestedRoleIgnoreCaseAndStatusAndIdNot(
            Long clubId, String requestedRole, String status, Long id);
    boolean existsByRequestedRoleIgnoreCaseAndStatusAndClubNameIgnoreCase(
            String requestedRole, String status, String clubName);
    boolean existsByRequestedRoleIgnoreCaseAndStatusAndClubNameIgnoreCaseAndIdNot(
            String requestedRole, String status, String clubName, Long id);
    long countByStatus(String status);
}
