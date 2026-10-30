package com.ziggiz.backend.payment;

import com.ziggiz.backend.model.BookingStatus;
import com.ziggiz.backend.repository.BookingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Exercises the complete backend payment path against a real HTTP server:
 * booking -> tokenize -> signed sandbox webhook -> payment status -> booking.
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "spring.datasource.url=jdbc:h2:mem:paymentflowtest;DB_CLOSE_DELAY=-1"
)
@Import(PaymentFlowIntegrationTest.FakeGatewayConfig.class)
class PaymentFlowIntegrationTest {

    private static final String WEBHOOK_SECRET = "integration-test-private-key";

    @LocalServerPort
    private int port;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    @DisplayName("sandbox payment flow confirms the booking after a signed webhook")
    void sandboxPaymentFlow() throws Exception {
        RestClient client = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .build();

        String email = "payment-test-" + System.nanoTime() + "@example.com";
        String bookingBody = objectMapper.writeValueAsString(Map.of(
                "service", "Quad Trips",
                "option", "Sunset Dune Run",
                "date", LocalDate.now().plusDays(10).toString(),
                "time", "06:15",
                "people", 2,
                "name", "Payment Test",
                "email", email
        ));

        JsonNode bookingResponse = objectMapper.readTree(client.post()
                .uri("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(bookingBody)
                .retrieve()
                .body(String.class));
        long bookingId = bookingResponse.path("booking").path("id").asLong();
        assertNotNull(bookingId);

        String initiateBody = objectMapper.writeValueAsString(Map.of("email", email));
        JsonNode initiateResponse = objectMapper.readTree(client.post()
                .uri("/api/payments/bookings/{id}/initiate", bookingId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(initiateBody)
                .retrieve()
                .body(String.class));

        assertEquals("PENDING", initiateResponse.path("status").asText());
        assertEquals(0, new BigDecimal("900.00")
                .compareTo(initiateResponse.path("amountMad").decimalValue()));
        assertEquals("token-test-1", initiateResponse.path("tokenId").asText());

        String webhookBody = """
                {"event_name":"transaction.paid","payload":{"transaction":{
                  "id":"tx-test-1","amount":"90000","currency":"MAD",
                  "order_id":"booking-%d"
                }}}
                """.formatted(bookingId);

        String response = client.post()
                .uri("/api/payments/webhook/youcanpay")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-YOUCANPAY-SIGNATURE", sign(webhookBody))
                .body(webhookBody)
                .retrieve()
                .body(String.class);
        assertEquals("{\"ok\":true}", response);

        JsonNode paymentResponse = objectMapper.readTree(client.get()
                .uri("/api/payments/bookings/{id}?email={email}", bookingId, email)
                .retrieve()
                .body(String.class));
        assertEquals("PAID", paymentResponse.path("status").asText());
        assertEquals(BookingStatus.CONFIRMED,
                bookingRepository.findById(bookingId).orElseThrow().getStatus());
    }

    private static String sign(String body) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
    }

    @TestConfiguration
    static class FakeGatewayConfig {

        @Bean
        @Primary
        PaymentGateway fakePaymentGateway() {
            return new FakePaymentGateway();
        }
    }

    private static class FakePaymentGateway implements PaymentGateway {

        @Override
        public TokenizeResult tokenize(String orderId, BigDecimal amountMad) {
            return new TokenizeResult("tx-test-1", "token-test-1");
        }

        @Override
        public TransactionResult fetchTransaction(String transactionId) {
            throw new AssertionError("Sandbox flow must not call the live v2 transactions API");
        }

        @Override
        public boolean verifyWebhookSignature(byte[] rawBody, String signature) {
            try {
                return signature != null && signature.equals(sign(new String(rawBody, StandardCharsets.UTF_8)));
            } catch (Exception ex) {
                throw new IllegalStateException(ex);
            }
        }

        @Override
        public boolean isConfigured() {
            return true;
        }

        @Override
        public String publicKey() {
            return "pub_sandbox_test";
        }

        @Override
        public boolean isSandbox() {
            return true;
        }
    }
}
