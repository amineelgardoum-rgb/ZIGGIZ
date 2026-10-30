package com.ziggiz.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long userId;
    private String serviceName;
    private String optionName;
    private LocalDate date;
    private String time;
    private Integer people;
    private BigDecimal unitPriceMad;
    private BigDecimal totalPriceMad;
    private String customerName;
    private String customerEmail;
    private String message;
    private String status;
    private LocalDateTime createdAt;
}
