package com.ziggiz.backend.service;

import com.ziggiz.backend.dto.ReviewResponse;
import com.ziggiz.backend.model.Review;
import com.ziggiz.backend.model.User;
import com.ziggiz.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

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

    public ReviewResponse createReview(Review review) {
        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    private ReviewResponse toResponse(Review review) {
        User user = review.getUser();
        return ReviewResponse.builder()
                .id(review.getId())
                .quote(review.getQuote())
                .userId(user != null ? user.getId() : null)
                .authorName(user != null ? user.getFullName() : null)
                .authorRole(review.getAuthorRole())
                .rating(review.getRating())
                .build();
    }
}
