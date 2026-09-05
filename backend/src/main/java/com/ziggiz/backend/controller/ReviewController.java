package com.ziggiz.backend.controller;

import com.ziggiz.backend.config.JwtUtil;
import com.ziggiz.backend.dto.ReviewRequest;
import com.ziggiz.backend.dto.ReviewResponse;
import com.ziggiz.backend.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getDisplayedReviews() {
        return ResponseEntity.ok(reviewService.getDisplayedReviews());
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllReviews(HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("ok", true, "review", review));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveReview(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(reviewService.approveReview(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectReview(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(reviewService.rejectReview(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token) || !"ADMIN".equals(jwtUtil.getRole(token))) {
            throw new RuntimeException("Admin access required");
        }
    }
}
