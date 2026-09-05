package com.ziggiz.backend.repository;

import com.ziggiz.backend.model.Booking;
import com.ziggiz.backend.model.BookingStatus;
import com.ziggiz.backend.model.SurfService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByCustomerEmail(String email);
    boolean existsByServiceAndDateAndSessionTime(SurfService service, LocalDate date, LocalTime sessionTime);
}
