package com.ziggiz.backend.service;

import com.ziggiz.backend.dto.PaymentInitiateRequest;
import com.ziggiz.backend.dto.PaymentInitiateResponse;
import com.ziggiz.backend.dto.PaymentResponse;
import com.ziggiz.backend.model.Booking;
import com.ziggiz.backend.model.BookingStatus;
import com.ziggiz.backend.model.Payment;
import com.ziggiz.backend.model.PaymentStatus;
import com.ziggiz.backend.model.ServiceOption;
import com.ziggiz.backend.payment.PaymentException;
import com.ziggiz.backend.payment.PaymentGateway;
import com.ziggiz.backend.repository.BookingRepository;
import com.ziggiz.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private static final String ORDER_PREFIX = "booking-";
    private static final Set<String> HANDLED_EVENTS = Set.of(
            "transaction.paid",
            "transaction.failed",
            "transaction.refunded"
    );

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentGateway paymentGateway;
    private final ObjectMapper objectMapper;

    /**
     * Creates (or refreshes) a YouCan Pay token for a booking. The customer's
     * browser then renders the card form with yp.js using tokenId/publicKey.
     */
    @Transactional
    public PaymentInitiateResponse initiatePayment(Long bookingId, PaymentInitiateRequest request) {
        if (!paymentGateway.isConfigured()) {
            throw new PaymentException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Online payment is not configured. Set YOUCANPAY_PRIVATE_KEY.");
        }

        Booking booking = findBooking(bookingId);
        requireBookingOwner(booking, request.getEmail());

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new PaymentException(HttpStatus.CONFLICT,
                    "This booking is cancelled and cannot be paid.");
        }

        BigDecimal amountMad = resolveAmount(booking);
        if (amountMad == null || amountMad.signum() <= 0) {
            throw new PaymentException(HttpStatus.BAD_REQUEST,
                    "This option is priced on request. Please contact us to arrange payment.");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseGet(() -> Payment.builder().booking(booking).build());

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new PaymentException(HttpStatus.CONFLICT, "This booking is already paid.");
        }

        PaymentGateway.TokenizeResult token = paymentGateway.tokenize(orderId(bookingId), amountMad);

        payment.setAmountMad(amountMad);
        payment.setCurrency("MAD");
        payment.setProvider("youcanpay");
        payment.setProviderTransactionId(token.transactionId());
        payment.setProviderTokenId(token.tokenId());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setFailureReason(null);

        Payment saved = paymentRepository.save(payment);
        return toInitiateResponse(saved);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(Long bookingId, String email) {
        Booking booking = findBooking(bookingId);
        requireBookingOwner(booking, email);

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new PaymentException(HttpStatus.NOT_FOUND,
                        "No payment has been started for this booking."));

        return toResponse(payment);
    }

    /**
     * YouCan Pay signs the raw body with the private key. After verifying the
     * signature, the transaction is read from the API instead of trusting the
     * webhook body, then amount, currency and order id are checked before the
     * booking is confirmed.
     */
    @Transactional
    public void handleWebhook(byte[] rawBody, String signature) {
        if (!paymentGateway.isConfigured()) {
            throw new PaymentException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Online payment is not configured. Set YOUCANPAY_PRIVATE_KEY.");
        }
        if (!paymentGateway.verifyWebhookSignature(rawBody, signature)) {
            throw new PaymentException(HttpStatus.UNAUTHORIZED, "Invalid YouCan Pay webhook signature.");
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(rawBody);
        } catch (JacksonException ex) {
            throw new PaymentException(HttpStatus.BAD_REQUEST, "Invalid YouCan Pay webhook payload.", ex);
        }

        String eventName = text(root, "event_name");
        if (eventName == null) {
            throw new PaymentException(HttpStatus.BAD_REQUEST, "Missing webhook event name.");
        }
        if (!HANDLED_EVENTS.contains(eventName)) {
            log.debug("Ignoring YouCan Pay event {}", eventName);
            return;
        }

        String transactionId = text(root.path("payload").path("transaction"), "id");
        if (transactionId == null) {
            throw new PaymentException(HttpStatus.BAD_REQUEST, "Missing webhook transaction id.");
        }

        PaymentGateway.TransactionResult transaction = paymentGateway.isSandbox()
                ? transactionFromWebhook(root, eventName, transactionId)
                : paymentGateway.fetchTransaction(transactionId);
        Payment payment = findPayment(transaction);
        verifyTransaction(payment, transaction);
        applyEvent(eventName, payment, transaction);
    }

    private Booking findBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new PaymentException(HttpStatus.NOT_FOUND, "Booking not found."));
    }

    private void requireBookingOwner(Booking booking, String email) {
        if (email == null || !booking.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new PaymentException(HttpStatus.FORBIDDEN,
                    "This email does not match the booking.");
        }
    }

    private BigDecimal resolveAmount(Booking booking) {
        if (booking.getTotalPriceMad() != null) {
            return booking.getTotalPriceMad();
        }

        ServiceOption option = booking.getOption();
        if (option.getPriceMad() == null) {
            return null;
        }

        BigDecimal unitPrice = option.getPriceMad();
        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(booking.getPeople()));
        booking.setUnitPriceMad(unitPrice);
        booking.setTotalPriceMad(total);
        return total;
    }

    private Payment findPayment(PaymentGateway.TransactionResult transaction) {
        Payment payment = paymentRepository.findByProviderTransactionId(transaction.id())
                .orElse(null);

        if (payment == null) {
            Long bookingId = parseOrderId(transaction.orderId());
            if (bookingId != null) {
                payment = paymentRepository.findByBookingId(bookingId).orElse(null);
            }
        }

        if (payment == null) {
            throw new PaymentException(HttpStatus.NOT_FOUND,
                    "No payment found for transaction " + transaction.id());
        }

        payment.setProviderTransactionId(transaction.id());
        return payment;
    }

    /**
     * The v2 Transactions API only accepts live keys, so sandbox payments are
     * verified from the already-authenticated webhook body. The signature still
     * covers the transaction id, amount, currency and order id.
     */
    private PaymentGateway.TransactionResult transactionFromWebhook(
            JsonNode root,
            String eventName,
            String transactionId
    ) {
        JsonNode transactionNode = root.path("payload").path("transaction");
        String status = switch (eventName) {
            case "transaction.paid" -> "paid";
            case "transaction.failed" -> "failed";
            case "transaction.refunded" -> "refunded";
            default -> null;
        };

        String amountText = text(transactionNode, "amount");
        BigDecimal amount;
        try {
            amount = amountText == null
                    ? null
                    : new BigDecimal(amountText).movePointLeft(2);
        } catch (NumberFormatException ex) {
            throw new PaymentException(HttpStatus.BAD_REQUEST,
                    "Invalid transaction amount in YouCan Pay webhook.", ex);
        }

        return new PaymentGateway.TransactionResult(
                transactionId,
                status,
                amount,
                text(transactionNode, "currency"),
                text(transactionNode, "order_id")
        );
    }

    private void verifyTransaction(Payment payment, PaymentGateway.TransactionResult transaction) {
        if (payment.getAmountMad() == null
                || transaction.amount() == null
                || payment.getAmountMad().compareTo(transaction.amount()) != 0) {
            throw new PaymentException(HttpStatus.BAD_REQUEST, "Payment amount mismatch.");
        }
        if (!"MAD".equalsIgnoreCase(transaction.currency())) {
            throw new PaymentException(HttpStatus.BAD_REQUEST, "Unsupported payment currency.");
        }
        if (!orderId(payment.getBooking().getId()).equals(transaction.orderId())) {
            throw new PaymentException(HttpStatus.BAD_REQUEST, "Payment order mismatch.");
        }
    }

    private void applyEvent(
            String eventName,
            Payment payment,
            PaymentGateway.TransactionResult transaction
    ) {
        Booking booking = payment.getBooking();
        String providerStatus = transaction.status();

        switch (eventName) {
            case "transaction.paid" -> {
                if (!"paid".equalsIgnoreCase(providerStatus)) {
                    throw new PaymentException(HttpStatus.BAD_GATEWAY,
                            "YouCan Pay has not settled this transaction yet.");
                }
                if (payment.getStatus() == PaymentStatus.PAID
                        || payment.getStatus() == PaymentStatus.REFUNDED) {
                    return;
                }
                payment.setStatus(PaymentStatus.PAID);
                payment.setFailureReason(null);
                booking.setStatus(BookingStatus.CONFIRMED);
            }
            case "transaction.failed" -> {
                if (!"failed".equalsIgnoreCase(providerStatus)
                        && !"canceled".equalsIgnoreCase(providerStatus)) {
                    throw new PaymentException(HttpStatus.BAD_GATEWAY,
                            "YouCan Pay has not finalised this transaction yet.");
                }
                if (payment.getStatus() == PaymentStatus.PAID
                        || payment.getStatus() == PaymentStatus.REFUNDED) {
                    return;
                }
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("YouCan Pay reported " + providerStatus);
            }
            case "transaction.refunded" -> {
                if (!"refunded".equalsIgnoreCase(providerStatus)) {
                    throw new PaymentException(HttpStatus.BAD_GATEWAY,
                            "YouCan Pay has not finalised the refund yet.");
                }
                if (payment.getStatus() == PaymentStatus.REFUNDED) {
                    return;
                }
                payment.setStatus(PaymentStatus.REFUNDED);
                payment.setFailureReason(null);
                booking.setStatus(BookingStatus.CANCELLED);
            }
            default -> {
                return;
            }
        }

        paymentRepository.save(payment);
        bookingRepository.save(booking);
    }

    private PaymentInitiateResponse toInitiateResponse(Payment payment) {
        return PaymentInitiateResponse.builder()
                .paymentId(payment.getId())
                .bookingId(payment.getBooking().getId())
                .status(payment.getStatus().name())
                .amountMad(payment.getAmountMad())
                .currency(payment.getCurrency())
                .provider(payment.getProvider())
                .tokenId(payment.getProviderTokenId())
                .publicKey(paymentGateway.publicKey())
                .sandbox(paymentGateway.isSandbox())
                .build();
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .status(payment.getStatus().name())
                .amountMad(payment.getAmountMad())
                .currency(payment.getCurrency())
                .provider(payment.getProvider())
                .providerTransactionId(payment.getProviderTransactionId())
                .providerTokenId(payment.getProviderTokenId())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    private String orderId(Long bookingId) {
        return ORDER_PREFIX + bookingId;
    }

    private Long parseOrderId(String orderId) {
        if (orderId == null || !orderId.startsWith(ORDER_PREFIX)) {
            return null;
        }
        try {
            return Long.valueOf(orderId.substring(ORDER_PREFIX.length()));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText();
        return text.isBlank() ? null : text;
    }
}
