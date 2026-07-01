package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubRepository extends JpaRepository<Club, Long> {
    Optional<Club> findByNameIgnoreCase(String name);
    List<Club> findByIsActiveTrueOrderByNameAsc();
    List<Club> findByIsActiveTrueAndSecretaryUserIdIsNullOrderByNameAsc();
}
