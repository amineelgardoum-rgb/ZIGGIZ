package com.ziggiz.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews")
@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String quote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String authorRole;

    @Column(nullable = false)
    @Builder.Default
    private Integer rating = 5;

    /**
     * Reviews are moderated: they must be explicitly approved before they
     * become visible. The old default (true) let any review bypass moderation.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean displayed = false;
}
