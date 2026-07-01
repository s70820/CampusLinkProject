package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.StudentNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentNotificationRepository extends JpaRepository<StudentNotification, Long> {
    List<StudentNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
}
