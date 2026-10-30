package com.ziggiz.backend.service;

import com.ziggiz.backend.dto.PaymentInitiateRequest;
import com.ziggiz.backend.dto.PaymentInitiateResponse;
import com.ziggiz.backend.dto.PaymentResponse;
import com.ziggiz.backend.model.Booking;
import com.ziggiz.backend.model.BookingStatus;
import com.ziggiz.backend.model.Payment;
import com.ziggiz.backend.model.PaymentStatus;
import com.ziggiz.backend.model.ServiceOption;
import com.ziggiz.backend.model.SurfService;
import com.ziggiz.backend.model.User;
import com.ziggiz.backend.payment.PaymentException;
import com.ziggiz.backend.payment.PaymentGateway;
import com.ziggiz.backend.repository.BookingRepository;
import com.ziggiz.backend.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentGateway paymentGateway;

    private PaymentService paymentService;
    private Booking booking;
    private ServiceOption option;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentRepository,
                bookingRepository,
                paymentGateway,
                new ObjectMapper()
        );

        User user = User.builder()
                .id(7L)
                .fullName("John Doe")
                .email("john@example.com")
                .password("pending")
                .build();

        SurfService service = SurfService.builder()
                .id(3L)
                .name("Quad Trips")
                .requiresTime(true)
                .build();

        option = ServiceOption.builder()
                .id(4L)
                .name("Sunset Dune Run")
                .priceMad(new BigDecimal("450.00"))
                .service(service)
                .build();

        booking = Booking.builder()
                .id(42L)
                .option(option)
                .date(LocalDate.now().plusDays(1))
                .people(2)
                .unitPriceMad(new BigDecimal("450.00"))
                .totalPriceMad(new BigDecimal("900.00"))
                .user(user)
                .status(BookingStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("initiate payment creates a pending payment and returns the token")
    void initiatePayment_whenConfigured_returnsTokenAndPersistsPendingPayment() {
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(bookingRepository.findById(42L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(42L)).thenReturn(Optional.empty());
        when(paymentGateway.tokenize(eq("booking-42"), any(BigDecimal.class)))
                .thenReturn(new PaymentGateway.TokenizeResult("tx-1", "token-1"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId(99L);
            return payment;
        });
        when(paymentGateway.publicKey()).thenReturn("public-key");
        when(paymentGateway.isSandbox()).thenReturn(true);

        PaymentInitiateResponse response = paymentService.initiatePayment(42L, request("john@example.com"));

        assertEquals(99L, response.getPaymentId());
        assertEquals(42L, response.getBookingId());
        assertEquals("PENDING", response.getStatus());
        assertEquals(0, response.getAmountMad().compareTo(new BigDecimal("900.00")));
        assertEquals("MAD", response.getCurrency());
        assertEquals("youcanpay", response.getProvider());
        assertEquals("token-1", response.getTokenId());
        assertEquals("public-key", response.getPublicKey());
        assertTrue(response.isSandbox());

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        Payment saved = captor.getValue();
        assertEquals(PaymentStatus.PENDING, saved.getStatus());
        assertEquals("tx-1", saved.getProviderTransactionId());
        assertEquals("token-1", saved.getProviderTokenId());
        assertEquals(0, saved.getAmountMad().compareTo(new BigDecimal("900.00")));
    }

    @Test
    @DisplayName("initiate payment rejects an unconfigured gateway")
    void initiatePayment_whenNotConfigured_returnsServiceUnavailable() {
        when(paymentGateway.isConfigured()).thenReturn(false);

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.initiatePayment(42L, request("john@example.com")));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatus());
        verifyNoInteractions(bookingRepository, paymentRepository);
        verify(paymentGateway, never()).tokenize(any(), any());
    }

    @Test
    @DisplayName("initiate payment rejects an email that does not own the booking")
    void initiatePayment_whenEmailDoesNotMatchBooking_returnsForbidden() {
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(bookingRepository.findById(42L)).thenReturn(Optional.of(booking));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.initiatePayment(42L, request("other@example.com")));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        verify(paymentGateway, never()).tokenize(any(), any());
    }

    @Test
    @DisplayName("initiate payment rejects an option priced on request")
    void initiatePayment_whenPriceOnRequest_returnsBadRequest() {
        booking.setUnitPriceMad(null);
        booking.setTotalPriceMad(null);
        option.setPriceMad(null);
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(bookingRepository.findById(42L)).thenReturn(Optional.of(booking));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.initiatePayment(42L, request("john@example.com")));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(paymentGateway, never()).tokenize(any(), any());
    }

    @Test
    @DisplayName("initiate payment rejects an already paid booking")
    void initiatePayment_whenAlreadyPaid_returnsConflict() {
        Payment payment = payment(PaymentStatus.PAID, "900.00");
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(bookingRepository.findById(42L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(42L)).thenReturn(Optional.of(payment));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.initiatePayment(42L, request("john@example.com")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        verify(paymentGateway, never()).tokenize(any(), any());
    }

    @Test
    @DisplayName("initiate payment fills a missing price snapshot from the option")
    void initiatePayment_whenSnapshotMissing_recomputesAmount() {
        booking.setUnitPriceMad(null);
        booking.setTotalPriceMad(null);
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(bookingRepository.findById(42L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(42L)).thenReturn(Optional.empty());
        when(paymentGateway.tokenize(eq("booking-42"), any(BigDecimal.class)))
                .thenReturn(new PaymentGateway.TokenizeResult("tx-1", "token-1"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        paymentService.initiatePayment(42L, request("john@example.com"));

        assertEquals(0, booking.getUnitPriceMad().compareTo(new BigDecimal("450.00")));
        assertEquals(0, booking.getTotalPriceMad().compareTo(new BigDecimal("900.00")));
        verify(paymentGateway).tokenize(eq("booking-42"),
                argThat(amount -> amount.compareTo(new BigDecimal("900.00")) == 0));
    }

    @Test
    @DisplayName("get payment returns the stored payment for the booking owner")
    void getPayment_whenFound_returnsPayment() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        when(bookingRepository.findById(42L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(42L)).thenReturn(Optional.of(payment));

        PaymentResponse response = paymentService.getPayment(42L, "john@example.com");

        assertEquals(payment.getId(), response.getId());
        assertEquals(42L, response.getBookingId());
        assertEquals("PENDING", response.getStatus());
        assertEquals(0, response.getAmountMad().compareTo(new BigDecimal("900.00")));
    }

    @Test
    @DisplayName("get payment fails when no payment was started")
    void getPayment_whenMissing_returnsNotFound() {
        when(bookingRepository.findById(42L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(42L)).thenReturn(Optional.empty());

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.getPayment(42L, "john@example.com"));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    @DisplayName("webhook rejects an invalid signature before reading the body")
    void handleWebhook_whenSignatureInvalid_returnsUnauthorized() {
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(paymentGateway.verifyWebhookSignature(any(byte[].class), eq("bad"))).thenReturn(false);

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.handleWebhook(webhookBody("transaction.paid"), "bad"));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        verify(paymentGateway, never()).fetchTransaction(any());
        verifyNoInteractions(bookingRepository, paymentRepository);
    }

    @Test
    @DisplayName("paid webhook confirms the booking")
    void handleWebhook_whenPaid_marksPaymentPaidAndBookingConfirmed() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("paid", "900.00", "MAD", "booking-42"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        paymentService.handleWebhook(webhookBody("transaction.paid"), "signature");

        assertEquals(PaymentStatus.PAID, payment.getStatus());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
        verify(paymentRepository).save(payment);
        verify(bookingRepository).save(booking);
    }

    @Test
    @DisplayName("sandbox webhook verifies the signed payload without calling the live v2 API")
    void handleWebhook_whenSandbox_usesSignedPayload() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(paymentGateway.isSandbox()).thenReturn(true);
        when(paymentGateway.verifyWebhookSignature(any(byte[].class), eq("signature"))).thenReturn(true);
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        paymentService.handleWebhook(
                sandboxWebhookBody("transaction.paid", "90000", "MAD", "booking-42"),
                "signature"
        );

        verify(paymentGateway, never()).fetchTransaction(any());
        assertEquals(PaymentStatus.PAID, payment.getStatus());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
    }

    @Test
    @DisplayName("sandbox webhook still rejects an amount mismatch")
    void handleWebhook_whenSandboxAmountMismatch_returnsBadRequest() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(paymentGateway.isSandbox()).thenReturn(true);
        when(paymentGateway.verifyWebhookSignature(any(byte[].class), eq("signature"))).thenReturn(true);
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.handleWebhook(
                        sandboxWebhookBody("transaction.paid", "89900", "MAD", "booking-42"),
                        "signature"
                ));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("paid webhook is idempotent once a payment is already paid")
    void handleWebhook_whenAlreadyPaid_isIdempotent() {
        Payment payment = payment(PaymentStatus.PAID, "900.00");
        booking.setStatus(BookingStatus.CONFIRMED);
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("paid", "900.00", "MAD", "booking-42"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        paymentService.handleWebhook(webhookBody("transaction.paid"), "signature");

        verify(paymentRepository, never()).save(any());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("failed webhook marks the payment failed without confirming the booking")
    void handleWebhook_whenFailed_marksPaymentFailedAndLeavesBookingPending() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("failed", "900.00", "MAD", "booking-42"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        paymentService.handleWebhook(webhookBody("transaction.failed"), "signature");

        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        assertNotNull(payment.getFailureReason());
        assertEquals(BookingStatus.PENDING, booking.getStatus());
        verify(paymentRepository).save(payment);
        verify(bookingRepository).save(booking);
    }

    @Test
    @DisplayName("refunded webhook cancels the booking")
    void handleWebhook_whenRefunded_marksRefundedAndCancelsBooking() {
        Payment payment = payment(PaymentStatus.PAID, "900.00");
        booking.setStatus(BookingStatus.CONFIRMED);
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("refunded", "900.00", "MAD", "booking-42"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        paymentService.handleWebhook(webhookBody("transaction.refunded"), "signature");

        assertEquals(PaymentStatus.REFUNDED, payment.getStatus());
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
        verify(paymentRepository).save(payment);
        verify(bookingRepository).save(booking);
    }

    @Test
    @DisplayName("webhook rejects a transaction whose amount differs from the payment")
    void handleWebhook_whenAmountMismatch_returnsBadRequest() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("paid", "899.00", "MAD", "booking-42"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.handleWebhook(webhookBody("transaction.paid"), "signature"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        verify(paymentRepository, never()).save(any());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("webhook rejects a transaction in another currency")
    void handleWebhook_whenCurrencyMismatch_returnsBadRequest() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("paid", "900.00", "USD", "booking-42"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.handleWebhook(webhookBody("transaction.paid"), "signature"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("webhook rejects a transaction for a different order")
    void handleWebhook_whenOrderMismatch_returnsBadRequest() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("paid", "900.00", "MAD", "booking-99"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.handleWebhook(webhookBody("transaction.paid"), "signature"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("webhook ignores events the application does not handle")
    void handleWebhook_whenEventUnknown_ignoresIt() {
        stubAuthenticWebhook();

        paymentService.handleWebhook(webhookBody("transaction.created"), "signature");

        verify(paymentGateway, never()).fetchTransaction(any());
        verifyNoInteractions(bookingRepository, paymentRepository);
    }

    @Test
    @DisplayName("webhook rejects an event whose transaction has not settled")
    void handleWebhook_whenTransactionNotSettled_returnsBadGateway() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("pending", "900.00", "MAD", "booking-42"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.of(payment));

        PaymentException exception = assertThrows(PaymentException.class,
                () -> paymentService.handleWebhook(webhookBody("transaction.paid"), "signature"));

        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("webhook finds the payment through the order id when the transaction id is new")
    void handleWebhook_whenTransactionIdUnknown_fallsBackToOrderId() {
        Payment payment = payment(PaymentStatus.PENDING, "900.00");
        stubAuthenticWebhook();
        when(paymentGateway.fetchTransaction("tx-1"))
                .thenReturn(transaction("paid", "900.00", "MAD", "booking-42"));
        when(paymentRepository.findByProviderTransactionId("tx-1")).thenReturn(Optional.empty());
        when(paymentRepository.findByBookingId(42L)).thenReturn(Optional.of(payment));

        paymentService.handleWebhook(webhookBody("transaction.paid"), "signature");

        assertEquals("tx-1", payment.getProviderTransactionId());
        assertEquals(PaymentStatus.PAID, payment.getStatus());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
    }

    private PaymentInitiateRequest request(String email) {
        return PaymentInitiateRequest.builder().email(email).build();
    }

    private Payment payment(PaymentStatus status, String amount) {
        return Payment.builder()
                .id(5L)
                .booking(booking)
                .status(status)
                .amountMad(new BigDecimal(amount))
                .currency("MAD")
                .provider("youcanpay")
                .providerTransactionId("tx-1")
                .build();
    }

    private PaymentGateway.TransactionResult transaction(
            String status,
            String amount,
            String currency,
            String orderId
    ) {
        return new PaymentGateway.TransactionResult(
                "tx-1",
                status,
                new BigDecimal(amount),
                currency,
                orderId
        );
    }

    private void stubAuthenticWebhook() {
        when(paymentGateway.isConfigured()).thenReturn(true);
        when(paymentGateway.verifyWebhookSignature(any(byte[].class), eq("signature"))).thenReturn(true);
    }

    private byte[] webhookBody(String eventName) {
        return """
                {"event_name":"%s","payload":{"transaction":{"id":"tx-1"}}}
                """.formatted(eventName).getBytes(StandardCharsets.UTF_8);
    }

    private byte[] sandboxWebhookBody(String eventName, String amount, String currency, String orderId) {
        return """
                {"event_name":"%s","payload":{"transaction":{"id":"tx-1","amount":"%s","currency":"%s","order_id":"%s"}}}
                """.formatted(eventName, amount, currency, orderId)
                .getBytes(StandardCharsets.UTF_8);
    }
}
