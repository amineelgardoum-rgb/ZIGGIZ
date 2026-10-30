package com.ziggiz.backend.service;

import com.ziggiz.backend.dto.ReviewRequest;
import com.ziggiz.backend.dto.ReviewResponse;
import com.ziggiz.backend.model.Review;
import com.ziggiz.backend.model.User;
import com.ziggiz.backend.repository.ReviewRepository;
import com.ziggiz.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getDisplayedReviews() {
        return reviewRepository.findByDisplayedTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName(request.getName())
                        .email(request.getEmail())
                        .password("pending")
                        .build()));

        Review review = Review.builder()
                .user(user)
                .quote(request.getQuote())
                .authorRole(request.getRole())
                .rating(5)
                .displayed(false)
                .build();

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Transactional
    public ReviewResponse approveReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setDisplayed(true);
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse rejectReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setDisplayed(false);
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    private ReviewResponse toResponse(Review review) {
        User user = review.getUser();
        return ReviewResponse.builder()
                .id(review.getId())
                .quote(review.getQuote())
                .userId(user.getId())
                .authorName(user.getFullName())
                .authorRole(review.getAuthorRole())
                .rating(review.getRating())
                .displayed(review.getDisplayed())
                .build();
    }
}
