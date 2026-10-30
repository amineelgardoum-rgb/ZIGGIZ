package com.ziggiz.backend.controller;

import com.ziggiz.backend.config.JwtUtil;
import com.ziggiz.backend.dto.BookingRequest;
import com.ziggiz.backend.dto.BookingResponse;
import com.ziggiz.backend.model.BookingStatus;
import com.ziggiz.backend.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("ok", true, "booking", booking));
    }

    @GetMapping
    public ResponseEntity<?> getAllBookings(HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getBookingsByStatus(@PathVariable BookingStatus status, HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        requireAdmin(request);
        BookingStatus status = BookingStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token)) {
            throw new RuntimeException("Unauthorized");
        }
        if (!"ADMIN".equals(jwtUtil.getRole(token))) {
            throw new RuntimeException("Admin access required");
        }
    }
}
