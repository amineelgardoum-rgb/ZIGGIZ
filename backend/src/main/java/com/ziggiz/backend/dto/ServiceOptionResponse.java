package com.ziggiz.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOptionResponse {
    private Long id;
    private String name;
    private String note;
    private BigDecimal priceMad;

    /**
     * Allowed departure slots in "HH:mm" form. Null when the option has no
     * fixed slots (or does not need a session time).
     */
    private List<String> times;
}
