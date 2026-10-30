package com.ziggiz.backend.controller;

import com.ziggiz.backend.config.JwtUtil;
import com.ziggiz.backend.model.*;
import com.ziggiz.backend.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final SurfServiceRepository surfServiceRepository;
    private final ServiceOptionRepository serviceOptionRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> dumpAll(HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(Map.of(
                "services", surfServiceRepository.findAll(),
                "options", serviceOptionRepository.findAll(),
                "bookings", bookingRepository.findAll(),
                "reviews", reviewRepository.findAll()
        ));
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
