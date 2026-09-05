package com.ziggiz.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOptionResponse {
    private Long id;
    private String name;
    private String note;
}
