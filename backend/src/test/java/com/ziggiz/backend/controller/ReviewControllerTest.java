package com.ziggiz.backend.controller;

import com.ziggiz.backend.config.JwtUtil;
import com.ziggiz.backend.dto.ReviewRequest;
import com.ziggiz.backend.dto.ReviewResponse;
import com.ziggiz.backend.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * UNIT TESTS FOR ReviewController
 * ==================================
 * PHILOSOPHY: Test review API logic with different access levels.
 *
 * KEY CONCEPTS:
 * 1. Public vs Admin endpoints - different auth requirements
 * 2. Content moderation workflow - approve/reject flow
 * 3. Response structure validation
 *
 * TEST COVERAGE:
 * - GET /api/reviews (public) - should work without auth
 * - GET /api/reviews/all (admin) - requires admin token
 * - POST /api/reviews (public) - should work without auth
 * - PATCH /api/reviews/{id}/approve (admin) - requires admin token
 * - PATCH /api/reviews/{id}/reject (admin) - requires admin token
 * - DELETE /api/reviews/{id} (admin) - requires admin token
 */
@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private ReviewController reviewController;

    @Mock
    private HttpServletRequest httpRequest;

    private ReviewResponse testReviewResponse;
    private ReviewRequest testReviewRequest;
    private String validAdminToken;

    @BeforeEach
    void setUp() {
        testReviewResponse = ReviewResponse.builder()
                .id(1L)
                .quote("Amazing surf experience!")
                .userId(1L)
                .authorName("Jane Doe")
                .authorRole("Tourist")
                .rating(5)
                .displayed(false)
                .build();

        testReviewRequest = ReviewRequest.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .quote("Amazing surf experience!")
                .role("Tourist")
                .build();

        validAdminToken = "valid-admin-token";
    }

    @Nested
    @DisplayName("getDisplayedReviews() tests")
    class GetDisplayedReviewsTests {

        @Test
        @DisplayName("should return displayed reviews without authentication")
        void getDisplayedReviews_withoutToken_returns200() {
            // ARRANGE
            List<ReviewResponse> reviews = Arrays.asList(testReviewResponse);
            when(reviewService.getDisplayedReviews()).thenReturn(reviews);

            // ACT
            ResponseEntity<List<ReviewResponse>> response = reviewController.getDisplayedReviews();

            // ASSERT
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(1, response.getBody().size());
            assertEquals("Amazing surf experience!", response.getBody().get(0).getQuote());
        }

        @Test
        @DisplayName("should return empty list when no reviews are displayed")
        void getDisplayedReviews_whenNone_returnsEmptyList() {
            // ARRANGE
            when(reviewService.getDisplayedReviews()).thenReturn(Arrays.asList());

            // ACT
            ResponseEntity<List<ReviewResponse>> response = reviewController.getDisplayedReviews();

            // ASSERT
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(response.getBody().isEmpty());
        }
    }

    @Nested
    @DisplayName("getAllReviews() tests")
    class GetAllReviewsTests {

        @Test
        @DisplayName("should return all reviews when admin token is valid")
        void getAllReviews_withValidAdminToken_returns200() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer " + validAdminToken);
            when(jwtUtil.isValid(validAdminToken)).thenReturn(true);
            when(jwtUtil.getRole(validAdminToken)).thenReturn("ADMIN");

            List<ReviewResponse> allReviews = Arrays.asList(testReviewResponse);
            when(reviewService.getAllReviews()).thenReturn(allReviews);

            // ACT
            ResponseEntity<?> response = reviewController.getAllReviews(httpRequest);

            // ASSERT
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }

        @Test
        @DisplayName("should return 401 when no token is provided")
        void getAllReviews_withoutToken_returns401() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn(null);

            // ACT & ASSERT
            assertThrows(RuntimeException.class, () -> {
                reviewController.getAllReviews(httpRequest);
            });
        }

        @Test
        @DisplayName("should return 403 when user is not admin")
        void getAllReviews_withClientToken_returns403() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer client-token");
            when(jwtUtil.isValid("client-token")).thenReturn(true);
            when(jwtUtil.getRole("client-token")).thenReturn("CLIENT");

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                reviewController.getAllReviews(httpRequest);
            });
            assertTrue(exception.getMessage().contains("Admin access required"));
        }
    }

    @Nested
    @DisplayName("createReview() tests")
    class CreateReviewTests {

        @Test
        @DisplayName("should create review and return 201 Created")
        void createReview_withValidRequest_returns201() {
            // ARRANGE
            when(reviewService.createReview(any(ReviewRequest.class)))
                    .thenReturn(testReviewResponse);

            // ACT
            ResponseEntity<Map<String, Object>> response = reviewController.createReview(testReviewRequest);

            // ASSERT
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            assertTrue((Boolean) response.getBody().get("ok"));
            assertNotNull(response.getBody().get("review"));
        }
    }

    @Nested
    @DisplayName("approveReview() tests")
    class ApproveReviewTests {

        @Test
        @DisplayName("should approve review when admin token is valid")
        void approveReview_withValidAdminToken_returns200() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer " + validAdminToken);
            when(jwtUtil.isValid(validAdminToken)).thenReturn(true);
            when(jwtUtil.getRole(validAdminToken)).thenReturn("ADMIN");

            ReviewResponse approvedResponse = ReviewResponse.builder()
                    .id(1L)
                    .quote("Amazing!")
                    .displayed(true)
                    .build();
            when(reviewService.approveReview(1L)).thenReturn(approvedResponse);

            // ACT
            ResponseEntity<?> response = reviewController.approveReview(1L, httpRequest);

            // ASSERT
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }

        @Test
        @DisplayName("should return 401 when approving without token")
        void approveReview_withoutToken_returns401() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn(null);

            // ACT & ASSERT
            assertThrows(RuntimeException.class, () -> {
                reviewController.approveReview(1L, httpRequest);
            });
        }

        @Test
        @DisplayName("should return 403 when client tries to approve")
        void approveReview_withClientToken_returns403() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer client-token");
            when(jwtUtil.isValid("client-token")).thenReturn(true);
            when(jwtUtil.getRole("client-token")).thenReturn("CLIENT");

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                reviewController.approveReview(1L, httpRequest);
            });
            assertTrue(exception.getMessage().contains("Admin access required"));
        }
    }

    @Nested
    @DisplayName("rejectReview() tests")
    class RejectReviewTests {

        @Test
        @DisplayName("should reject review when admin token is valid")
        void rejectReview_withValidAdminToken_returns200() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer " + validAdminToken);
            when(jwtUtil.isValid(validAdminToken)).thenReturn(true);
            when(jwtUtil.getRole(validAdminToken)).thenReturn("ADMIN");

            ReviewResponse rejectedResponse = ReviewResponse.builder()
                    .id(1L)
                    .quote("Rejected review")
                    .displayed(false)
                    .build();
            when(reviewService.rejectReview(1L)).thenReturn(rejectedResponse);

            // ACT
            ResponseEntity<?> response = reviewController.rejectReview(1L, httpRequest);

            // ASSERT
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }

        @Test
        @DisplayName("should return 401 when rejecting without token")
        void rejectReview_withoutToken_returns401() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn(null);

            // ACT & ASSERT
            assertThrows(RuntimeException.class, () -> {
                reviewController.rejectReview(1L, httpRequest);
            });
        }
    }

    @Nested
    @DisplayName("deleteReview() tests")
    class DeleteReviewTests {

        @Test
        @DisplayName("should delete review and return 204 No Content")
        void deleteReview_withValidAdminToken_returns204() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer " + validAdminToken);
            when(jwtUtil.isValid(validAdminToken)).thenReturn(true);
            when(jwtUtil.getRole(validAdminToken)).thenReturn("ADMIN");
            doNothing().when(reviewService).deleteReview(1L);

            // ACT
            ResponseEntity<?> response = reviewController.deleteReview(1L, httpRequest);

            // ASSERT
            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(reviewService).deleteReview(1L);
        }

        @Test
        @DisplayName("should return 401 when deleting without token")
        void deleteReview_withoutToken_returns401() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn(null);

            // ACT & ASSERT
            assertThrows(RuntimeException.class, () -> {
                reviewController.deleteReview(1L, httpRequest);
            });
        }
    }
}
