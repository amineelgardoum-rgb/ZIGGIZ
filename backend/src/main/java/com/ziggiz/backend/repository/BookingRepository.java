package com.ziggiz.backend.repository;

import com.ziggiz.backend.model.Booking;
import com.ziggiz.backend.model.BookingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Every booking response needs its option, the option's service and the
     * customer. Fetch them in the same query instead of triggering three
     * lazy loads per booking (N+1).
     */
    @Override
    @EntityGraph(attributePaths = {"option", "option.service", "user"})
    List<Booking> findAll();

    @Override
    @EntityGraph(attributePaths = {"option", "option.service", "user"})
    Optional<Booking> findById(Long id);

    @EntityGraph(attributePaths = {"option", "option.service", "user"})
    List<Booking> findByStatus(BookingStatus status);

    /**
     * A cancelled booking must not keep a time slot blocked forever, therefore
     * the status is part of the query.
     */
    boolean existsByOptionServiceIdAndDateAndSessionTimeAndStatusNot(
            Long serviceId,
            LocalDate date,
            LocalTime sessionTime,
            BookingStatus excludedStatus
    );
}
