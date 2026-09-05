package com.ziggiz.backend.service;

import com.ziggiz.backend.dto.*;
import com.ziggiz.backend.model.*;
import com.ziggiz.backend.repository.BookingRepository;
import com.ziggiz.backend.repository.ServiceOptionRepository;
import com.ziggiz.backend.repository.SurfServiceRepository;
import com.ziggiz.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SurfServiceRepository surfServiceRepository;
    private final ServiceOptionRepository serviceOptionRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        SurfService surfService = findServiceByName(request.getService());
        ServiceOption option = findOptionByName(surfService.getId(), request.getOption());

        LocalTime sessionTime = null;
        if (request.getTime() != null && !request.getTime().isBlank()) {
            sessionTime = LocalTime.parse(request.getTime());

            if (bookingRepository.existsByServiceAndDateAndSessionTime(surfService, request.getDate(), sessionTime)) {
                throw new RuntimeException("This time slot is already booked. Please choose another time.");
            }
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName(request.getName())
                        .email(request.getEmail())
                        .password("pending")
                        .build()));

        Booking booking = Booking.builder()
                .service(surfService)
                .option(option)
                .date(request.getDate())
                .sessionTime(sessionTime)
                .people(request.getPeople())
                .user(user)
                .customerName(request.getName())
                .customerEmail(request.getEmail())
                .message(request.getMessage())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        booking.setStatus(status);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    private SurfService findServiceByName(String name) {
        return surfServiceRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Service not found: " + name));
    }

    private ServiceOption findOptionByName(Long serviceId, String name) {
        return serviceOptionRepository.findByServiceId(serviceId).stream()
                .filter(o -> o.getName().equals(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Option not found: " + name + " for service id: " + serviceId));
    }

    private BookingResponse toResponse(Booking booking) {
        User user = booking.getUser();
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(user != null ? user.getId() : null)
                .serviceName(booking.getService().getName())
                .optionName(booking.getOption().getName())
                .date(booking.getDate())
                .time(booking.getSessionTime() != null ? booking.getSessionTime().toString() : null)
                .people(booking.getPeople())
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                .message(booking.getMessage())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
