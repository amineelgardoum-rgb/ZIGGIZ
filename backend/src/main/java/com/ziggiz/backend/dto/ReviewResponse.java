package com.ziggiz.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String quote;
    private Long userId;
    private String authorName;
    private String authorRole;
    private Integer rating;
}
