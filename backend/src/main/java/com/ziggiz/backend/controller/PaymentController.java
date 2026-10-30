package com.ziggiz.backend.controller;

import com.ziggiz.backend.dto.PaymentInitiateRequest;
import com.ziggiz.backend.dto.PaymentInitiateResponse;
import com.ziggiz.backend.dto.PaymentResponse;
import com.ziggiz.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Step 1 of the YouCan Pay flow. The response contains tokenId/publicKey;
     * the browser renders the card form with yp.js.
     */
    @PostMapping("/bookings/{bookingId}/initiate")
    public ResponseEntity<PaymentInitiateResponse> initiatePayment(
            @PathVariable Long bookingId,
            @Valid @RequestBody PaymentInitiateRequest request
    ) {
        return ResponseEntity.ok(paymentService.initiatePayment(bookingId, request));
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable Long bookingId,
            @RequestParam String email
    ) {
        return ResponseEntity.ok(paymentService.getPayment(bookingId, email));
    }

    /**
     * Public endpoint called by YouCan Pay. The signature over the raw body is
     * the authentication; do not add a user JWT here.
     */
    @PostMapping("/webhook/youcanpay")
    public ResponseEntity<Map<String, Object>> youCanPayWebhook(
            @RequestBody byte[] rawBody,
            @RequestHeader(value = "X-YOUCANPAY-SIGNATURE", required = false) String signature
    ) {
        paymentService.handleWebhook(rawBody, signature);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
