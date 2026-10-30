package com.ziggiz.backend.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {
    private Long id;
    private String name;
    private String description;
    private String image;
    private boolean requiresTime;
    private List<ServiceOptionResponse> options;
}
