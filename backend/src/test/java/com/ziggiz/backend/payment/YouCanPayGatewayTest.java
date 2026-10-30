package com.ziggiz.backend.payment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class YouCanPayGatewayTest {

    private static final String PRIVATE_KEY = "test-private-key";

    private YouCanPayProperties properties;
    private YouCanPayGateway gateway;

    @BeforeEach
    void setUp() {
        properties = new YouCanPayProperties();
        properties.setPrivateKey(PRIVATE_KEY);
        properties.setPublicKey("test-public-key");
        properties.setSandbox(true);
        gateway = new YouCanPayGateway(properties);
    }

    @Test
    @DisplayName("accepts a hex HMAC-SHA256 signature computed with the private key")
    void verifyWebhookSignature_whenValid_returnsTrue() throws Exception {
        byte[] body = "{\"event_name\":\"transaction.paid\"}".getBytes(StandardCharsets.UTF_8);

        assertTrue(gateway.verifyWebhookSignature(body, sign(body)));
    }

    @Test
    @DisplayName("verification is case-insensitive for the hex signature")
    void verifyWebhookSignature_whenUppercase_returnsTrue() throws Exception {
        byte[] body = "{}".getBytes(StandardCharsets.UTF_8);

        assertTrue(gateway.verifyWebhookSignature(body, sign(body).toUpperCase()));
    }

    @Test
    @DisplayName("rejects a signature for a different body")
    void verifyWebhookSignature_whenBodyChanged_returnsFalse() throws Exception {
        byte[] body = "{\"event_name\":\"transaction.paid\"}".getBytes(StandardCharsets.UTF_8);
        String signature = sign(body);

        assertFalse(gateway.verifyWebhookSignature("{}".getBytes(StandardCharsets.UTF_8), signature));
    }

    @Test
    @DisplayName("rejects a missing or blank signature")
    void verifyWebhookSignature_whenMissing_returnsFalse() {
        assertFalse(gateway.verifyWebhookSignature(new byte[0], null));
        assertFalse(gateway.verifyWebhookSignature(new byte[0], "   "));
    }

    @Test
    @DisplayName("an empty private key means payment is not configured")
    void isConfigured_whenPrivateKeyBlank_returnsFalse() {
        properties.setPrivateKey("");

        assertFalse(gateway.isConfigured());
    }

    @Test
    @DisplayName("exposes the public key and sandbox flag from configuration")
    void exposesPublicConfiguration() {
        assertTrue(gateway.isConfigured());
        assertEquals("test-public-key", gateway.publicKey());
        assertTrue(gateway.isSandbox());
    }

    private String sign(byte[] body) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(PRIVATE_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(body));
    }
}
