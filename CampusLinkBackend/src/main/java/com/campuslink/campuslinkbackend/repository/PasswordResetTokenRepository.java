package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.PasswordResetToken;
import com.campuslink.campuslinkbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUser(User user);
}
