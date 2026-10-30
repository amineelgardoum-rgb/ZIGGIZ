package com.ziggiz.backend.payment;

import java.math.BigDecimal;

/**
 * Provider boundary. PaymentService depends on this interface so the
 * YouCan Pay HTTP details stay out of the business logic and tests can
 * replace the provider with a mock.
 */
public interface PaymentGateway {

    TokenizeResult tokenize(String orderId, BigDecimal amountMad);

    TransactionResult fetchTransaction(String transactionId);

    boolean verifyWebhookSignature(byte[] rawBody, String signature);

    boolean isConfigured();

    String publicKey();

    boolean isSandbox();

    record TokenizeResult(String transactionId, String tokenId) {
    }

    record TransactionResult(
            String id,
            String status,
            BigDecimal amount,
            String currency,
            String orderId
    ) {
    }
}
