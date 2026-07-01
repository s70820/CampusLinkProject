package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.StudentCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentCertificateRepository extends JpaRepository<StudentCertificate, Long> {
    List<StudentCertificate> findByUserIdOrderByIssuedAtDesc(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
    boolean existsByUserIdAndProgrammeId(Long userId, Long programmeId);
    java.util.Optional<StudentCertificate> findByUserIdAndProgrammeId(Long userId, Long programmeId);
    java.util.Optional<StudentCertificate> findByIdAndUserId(Long id, Long userId);
}
