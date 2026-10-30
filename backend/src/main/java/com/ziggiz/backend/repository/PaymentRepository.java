package com.ziggiz.backend.repository;

import com.ziggiz.backend.model.Payment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.option"})
    Optional<Payment> findByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.option"})
    Optional<Payment> findByProviderTransactionId(String providerTransactionId);
}
