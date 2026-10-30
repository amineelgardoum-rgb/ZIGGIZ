package com.ziggiz.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateResponse {
    private Long paymentId;
    private Long bookingId;
    private String status;
    private BigDecimal amountMad;
    private String currency;
    private String provider;
    private String tokenId;
    private String publicKey;
    private boolean sandbox;
}
