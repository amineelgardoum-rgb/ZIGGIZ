package com.ziggiz.backend.service;

import com.ziggiz.backend.dto.ReviewRequest;
import com.ziggiz.backend.dto.ReviewResponse;
import com.ziggiz.backend.model.Review;
import com.ziggiz.backend.model.User;
import com.ziggiz.backend.repository.ReviewRepository;
import com.ziggiz.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * UNIT TESTS FOR ReviewService
 * ==============================
 * PHILOSOPHY: Test review workflow business logic in isolation.
 *
 * KEY CONCEPTS:
 * 1. Testing state transitions (displayed: false -> true)
 * 2. Testing moderation workflow (approve/reject/delete)
 * 3. Testing user lookup/creation pattern
 *
 * WHY THIS MATTERS:
 * - Reviews are public-facing - bugs here affect trust
 * - The approve/reject flow is critical for content moderation
 * - User auto-creation needs to be tested for duplication issues
 */
@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User testUser;
    private Review testReview;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .fullName("Jane Doe")
                .email("jane@example.com")
                .password("pending")
                .build();

        testReview = Review.builder()
                .id(1L)
                .quote("Amazing surf experience!")
                .user(testUser)
                .authorRole("Tourist")
                .rating(5)
                .displayed(false) // New reviews start hidden
                .build();
    }

    @Nested
    @DisplayName("getDisplayedReviews() tests")
    class GetDisplayedReviewsTests {

        @Test
        @DisplayName("should return only displayed reviews")
        void getDisplayedReviews_whenReviewsExist_returnsOnlyDisplayed() {
            // ARRANGE
            Review displayedReview = Review.builder()
                    .id(1L)
                    .quote("Great!")
                    .user(testUser)
                    .rating(5)
                    .displayed(true) // This one is approved
                    .build();

            when(reviewRepository.findByDisplayedTrue())
                    .thenReturn(Arrays.asList(displayedReview));

            // ACT
            List<ReviewResponse> reviews = reviewService.getDisplayedReviews();

            // ASSERT
            assertEquals(1, reviews.size());
            assertTrue(reviews.get(0).isDisplayed());
        }

        @Test
        @DisplayName("should return empty list when no reviews are displayed")
        void getDisplayedReviews_whenNoneDisplayed_returnsEmptyList() {
            // ARRANGE
            when(reviewRepository.findByDisplayedTrue()).thenReturn(Arrays.asList());

            // ACT
            List<ReviewResponse> reviews = reviewService.getDisplayedReviews();

            // ASSERT
            assertNotNull(reviews);
            assertTrue(reviews.isEmpty());
        }
    }

    @Nested
    @DisplayName("getAllReviews() tests")
    class GetAllReviewsTests {

        @Test
        @DisplayName("should return all reviews regardless of displayed status")
        void getAllReviews_whenMixedStatus_returnsAll() {
            // ARRANGE
            Review hiddenReview = Review.builder()
                    .id(1L)
                    .quote("Hidden review")
                    .user(testUser)
                    .rating(4)
                    .displayed(false)
                    .build();

            Review visibleReview = Review.builder()
                    .id(2L)
                    .quote("Visible review")
                    .user(testUser)
                    .rating(5)
                    .displayed(true)
                    .build();

            when(reviewRepository.findAll())
                    .thenReturn(Arrays.asList(hiddenReview, visibleReview));

            // ACT
            List<ReviewResponse> reviews = reviewService.getAllReviews();

            // ASSERT
            assertEquals(2, reviews.size(), "Should return ALL reviews, not just displayed");
        }
    }

    @Nested
    @DisplayName("createReview() tests")
    class CreateReviewTests {

        @Test
        @DisplayName("should create review with displayed=false for new user")
        void createReview_forNewUser_createsReviewWithDisplayedFalse() {
            // ARRANGE
            when(userRepository.findByEmail("jane@example.com"))
                    .thenReturn(Optional.empty());

            when(userRepository.save(any(User.class)))
                    .thenReturn(testUser);

            when(reviewRepository.save(any(Review.class)))
                    .thenReturn(testReview);

            ReviewRequest request = ReviewRequest.builder()
                    .name("Jane Doe")
                    .email("jane@example.com")
                    .quote("Amazing surf experience!")
                    .role("Tourist")
                    .build();

            // ACT
            ReviewResponse response = reviewService.createReview(request);

            // ASSERT
            assertNotNull(response);
            assertEquals("Amazing surf experience!", response.getQuote());
            assertFalse(response.isDisplayed(), "New reviews should start hidden (displayed=false)");
            assertEquals(5, response.getRating(), "Rating should default to 5");

            // Verify user creation happened
            verify(userRepository).save(any(User.class));
            verify(reviewRepository).save(any(Review.class));
        }

        @Test
        @DisplayName("should reuse existing user when email already exists")
        void createReview_forExistingUser_reusesUser() {
            // ARRANGE
            when(userRepository.findByEmail("jane@example.com"))
                    .thenReturn(Optional.of(testUser));

            when(reviewRepository.save(any(Review.class)))
                    .thenReturn(testReview);

            ReviewRequest request = ReviewRequest.builder()
                    .name("Jane Doe")
                    .email("jane@example.com")
                    .quote("Great experience!")
                    .role("Tourist")
                    .build();

            // ACT
            reviewService.createReview(request);

            // ASSERT
            // User should NOT be created again - just reused
            verify(userRepository, never()).save(any(User.class));
            verify(reviewRepository).save(any(Review.class));
        }
    }

    @Nested
    @DisplayName("approveReview() tests")
    class ApproveReviewTests {

        @Test
        @DisplayName("should set displayed=true when approving review")
        void approveReview_whenPending_setsDisplayedTrue() {
            // ARRANGE
            Review pendingReview = Review.builder()
                    .id(1L)
                    .quote("Pending review")
                    .user(testUser)
                    .rating(5)
                    .displayed(false) // Currently hidden
                    .build();

            when(reviewRepository.findById(1L))
                    .thenReturn(Optional.of(pendingReview));
            when(reviewRepository.save(any(Review.class)))
                    .thenReturn(pendingReview);

            // ACT
            ReviewResponse response = reviewService.approveReview(1L);

            // ASSERT
            assertTrue(response.isDisplayed(), "Approved review should have displayed=true");
            assertTrue(pendingReview.getDisplayed(), "Entity should be updated");
            verify(reviewRepository).save(pendingReview);
        }

        @Test
        @DisplayName("should throw exception when review not found")
        void approveReview_whenNotFound_throwsException() {
            // ARRANGE
            when(reviewRepository.findById(999L))
                    .thenReturn(Optional.empty());

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                reviewService.approveReview(999L);
            });

            assertTrue(exception.getMessage().contains("not found"));
        }
    }

    @Nested
    @DisplayName("rejectReview() tests")
    class RejectReviewTests {

        @Test
        @DisplayName("should set displayed=false when rejecting review")
        void rejectReview_whenApproved_setsDisplayedFalse() {
            // ARRANGE
            Review approvedReview = Review.builder()
                    .id(1L)
                    .quote("Previously approved")
                    .user(testUser)
                    .rating(5)
                    .displayed(true) // Currently visible
                    .build();

            when(reviewRepository.findById(1L))
                    .thenReturn(Optional.of(approvedReview));
            when(reviewRepository.save(any(Review.class)))
                    .thenReturn(approvedReview);

            // ACT
            ReviewResponse response = reviewService.rejectReview(1L);

            // ASSERT
            assertFalse(response.isDisplayed(), "Rejected review should have displayed=false");
            assertFalse(approvedReview.getDisplayed(), "Entity should be updated");
        }
    }

    @Nested
    @DisplayName("deleteReview() tests")
    class DeleteReviewTests {

        @Test
        @DisplayName("should delete review by id")
        void deleteReview_whenExists_deletesSuccessfully() {
            // ACT
            reviewService.deleteReview(1L);

            // ASSERT
            verify(reviewRepository, times(1)).deleteById(1L);
        }
    }
}
