package com.ziggiz.backend.payment;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;

@Component
@Slf4j
public class YouCanPayGateway implements PaymentGateway {

    private final YouCanPayProperties properties;
    private final RestClient restClient;

   @Autowired
public YouCanPayGateway(YouCanPayProperties properties) {
    this(properties, RestClient.builder());
}


    YouCanPayGateway(YouCanPayProperties properties, RestClient.Builder builder) {
        this.properties = properties;
        this.restClient = builder
                .baseUrl(resolveBaseUrl(properties))
                .build();
    }

    private static String resolveBaseUrl(YouCanPayProperties properties) {
        String baseUrl = properties.getBaseUrl() == null
                ? "https://youcanpay.com"
                : properties.getBaseUrl().replaceAll("/+$", "");
        return properties.isSandbox() && !baseUrl.endsWith("/sandbox")
                ? baseUrl + "/sandbox"
                : baseUrl;
    }

    @Override
    public TokenizeResult tokenize(String orderId, BigDecimal amountMad) {
        if (!isConfigured()) {
            throw new PaymentException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Online payment is not configured. Set YOUCANPAY_PRIVATE_KEY.");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("amount", toSmallestUnit(amountMad));
        form.add("currency", "MAD");
        form.add("pri_key", properties.getPrivateKey());
        form.add("order_id", orderId);
        form.add("success_url", properties.getSuccessUrl());
        form.add("error_url", properties.getErrorUrl());

        try {
            YouCanPayTokenizeResponse response = restClient.post()
                    .uri("/api/tokenize")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(form)
                    .retrieve()
                    .body(YouCanPayTokenizeResponse.class);

            if (response == null
                    || response.getTransactionId() == null
                    || response.getToken() == null
                    || response.getToken().getId() == null) {
                throw new PaymentException(HttpStatus.BAD_GATEWAY,
                        "YouCan Pay returned an incomplete token response.");
            }

            return new TokenizeResult(response.getTransactionId(), response.getToken().getId());
        } catch (RestClientResponseException ex) {
            log.warn("YouCan Pay tokenize failed with status {}: {}",
                    ex.getStatusCode().value(), ex.getResponseBodyAsString());
            throw new PaymentException(HttpStatus.BAD_GATEWAY,
                    "YouCan Pay rejected the payment request.", ex);
        } catch (RestClientException ex) {
            log.warn("YouCan Pay tokenize request failed", ex);
            throw new PaymentException(HttpStatus.BAD_GATEWAY,
                    "Could not reach YouCan Pay.", ex);
        }
    }

    @Override
    public TransactionResult fetchTransaction(String transactionId) {
        if (!isConfigured()) {
            throw new PaymentException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Online payment is not configured. Set YOUCANPAY_PRIVATE_KEY.");
        }

        try {
            YouCanPayTransactionResponse response = restClient.get()
                    .uri("/api/v2/transactions/{id}", transactionId)
                    .headers(headers -> headers.setBasicAuth(properties.getPrivateKey(), ""))
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(YouCanPayTransactionResponse.class);

            if (response == null || response.getId() == null || response.getStatus() == null) {
                throw new PaymentException(HttpStatus.BAD_GATEWAY,
                        "YouCan Pay returned an incomplete transaction.");
            }

            BigDecimal amount = response.getAmount() != null && response.getAmount().getAmount() != null
                    ? new BigDecimal(response.getAmount().getAmount())
                    : null;
            String currency = response.getAmount() != null ? response.getAmount().getCurrency() : null;

            return new TransactionResult(
                    response.getId(),
                    response.getStatus(),
                    amount,
                    currency,
                    response.getOrderId()
            );
        } catch (RestClientResponseException ex) {
            log.warn("YouCan Pay transaction lookup failed with status {}: {}",
                    ex.getStatusCode().value(), ex.getResponseBodyAsString());
            throw new PaymentException(HttpStatus.BAD_GATEWAY,
                    "Could not verify the payment with YouCan Pay.", ex);
        } catch (RestClientException ex) {
            log.warn("YouCan Pay transaction lookup failed", ex);
            throw new PaymentException(HttpStatus.BAD_GATEWAY,
                    "Could not reach YouCan Pay.", ex);
        }
    }

    @Override
    public boolean verifyWebhookSignature(byte[] rawBody, String signature) {
        if (!isConfigured() || signature == null || signature.isBlank()) {
            return false;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    properties.getPrivateKey().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            ));
            byte[] expected = HexFormat.of()
                    .formatHex(mac.doFinal(rawBody))
                    .getBytes(StandardCharsets.US_ASCII);
            byte[] received = signature.toLowerCase(Locale.ROOT)
                    .getBytes(StandardCharsets.US_ASCII);

            return MessageDigest.isEqual(expected, received);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("HmacSHA256 is not available", ex);
        }
    }

    @Override
    public boolean isConfigured() {
        return properties.getPrivateKey() != null && !properties.getPrivateKey().isBlank();
    }

    @Override
    public String publicKey() {
        return properties.getPublicKey();
    }

    @Override
    public boolean isSandbox() {
        return properties.isSandbox();
    }

    private String toSmallestUnit(BigDecimal amountMad) {
        try {
            return amountMad
                    .setScale(2, RoundingMode.UNNECESSARY)
                    .movePointRight(2)
                    .toBigIntegerExact()
                    .toString();
        } catch (ArithmeticException ex) {
            throw new PaymentException(HttpStatus.BAD_REQUEST,
                    "Payment amount must have at most 2 decimals.");
        }
    }
}
