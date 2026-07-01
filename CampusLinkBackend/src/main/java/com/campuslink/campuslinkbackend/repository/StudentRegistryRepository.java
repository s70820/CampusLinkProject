package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.StudentRegistry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRegistryRepository extends JpaRepository<StudentRegistry, Long> {
    Optional<StudentRegistry> findByMatricNumberIgnoreCase(String matricNumber);
}
