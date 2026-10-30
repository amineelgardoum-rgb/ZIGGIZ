package com.ziggiz.backend.payment;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class PaymentException extends RuntimeException {

    private final HttpStatus status;

    public PaymentException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public PaymentException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }
}
