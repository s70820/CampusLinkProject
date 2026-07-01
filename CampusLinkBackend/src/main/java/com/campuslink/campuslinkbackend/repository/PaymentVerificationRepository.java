package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.PaymentVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentVerificationRepository extends JpaRepository<PaymentVerification, Long> {
    Optional<PaymentVerification> findByPaymentReceiptId(Long paymentReceiptId);
}
