package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long> {
    Optional<PaymentReceipt> findByProgrammeRegistrationId(Long programmeRegistrationId);
}
