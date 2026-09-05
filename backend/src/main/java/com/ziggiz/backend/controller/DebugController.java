package com.ziggiz.backend.controller;

import com.ziggiz.backend.model.*;
import com.ziggiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/db")
    public Map<String, Object> dumpAll() {
        return Map.of(
                "services", surfServiceRepository.findAll(),
                "options", serviceOptionRepository.findAll(),
                "bookings", bookingRepository.findAll(),
                "reviews", reviewRepository.findAll()
        );
    }
}
