package com.ziggiz.backend.payment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class YouCanPayGatewayHttpTest {

    private YouCanPayProperties properties;
    private MockRestServiceServer server;
    private YouCanPayGateway gateway;

    @BeforeEach
    void setUp() {
        properties = new YouCanPayProperties();
        properties.setPrivateKey("pri_sandbox_test");
        properties.setPublicKey("pub_sandbox_test");
        properties.setSandbox(true);
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        gateway = new YouCanPayGateway(properties, builder);
    }

    @Test
    @DisplayName("sandbox tokenization posts to /sandbox/api/tokenize with the amount in centimes")
    void tokenize_whenSandbox_postsToSandboxEndpoint() {
        server.expect(requestTo("https://youcanpay.com/sandbox/api/tokenize"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("amount=90000")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("order_id=booking-42")))
                .andRespond(withSuccess(
                        "{\"transaction_id\":\"tx-1\",\"token\":{\"id\":\"token-1\"}}",
                        MediaType.APPLICATION_JSON
                ));

        PaymentGateway.TokenizeResult result = gateway.tokenize("booking-42", new BigDecimal("900.00"));

        assertEquals("tx-1", result.transactionId());
        assertEquals("token-1", result.tokenId());
        server.verify();
    }

    @Test
    @DisplayName("live transaction lookup reads the money object and string status")
    void fetchTransaction_whenLive_readsV2MoneyObject() {
        properties.setSandbox(false);
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        gateway = new YouCanPayGateway(properties, builder);

        server.expect(requestTo("https://youcanpay.com/api/v2/transactions/tx-1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("""
                        {
                          "id": "tx-1",
                          "status": "paid",
                          "order_id": "booking-42",
                          "amount": {"amount": "900.00", "currency": "MAD"}
                        }
                        """, MediaType.APPLICATION_JSON));

        PaymentGateway.TransactionResult result = gateway.fetchTransaction("tx-1");

        assertEquals("tx-1", result.id());
        assertEquals("paid", result.status());
        assertEquals(0, new BigDecimal("900.00").compareTo(result.amount()));
        assertEquals("MAD", result.currency());
        assertEquals("booking-42", result.orderId());
        server.verify();
    }

    @Test
    @DisplayName("provider rejection becomes a bad gateway error")
    void fetchTransaction_whenProviderRejects_throwsBadGateway() {
        properties.setSandbox(false);
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        gateway = new YouCanPayGateway(properties, builder);

        server.expect(requestTo("https://youcanpay.com/api/v2/transactions/tx-1"))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> gateway.fetchTransaction("tx-1"));

        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus());
        server.verify();
    }
}
