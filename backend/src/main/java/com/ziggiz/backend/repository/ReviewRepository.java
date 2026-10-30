package com.ziggiz.backend.repository;

import com.ziggiz.backend.model.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Review responses expose the author's name, so the user must be loaded
     * with the reviews in a single query.
     */
    @Override
    @EntityGraph(attributePaths = "user")
    List<Review> findAll();

    @Override
    @EntityGraph(attributePaths = "user")
    Optional<Review> findById(Long id);

    @EntityGraph(attributePaths = "user")
    List<Review> findByDisplayedTrue();
}
