package com.ziggiz.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The option is the single source of truth for the service too:
     * a booking cannot reference a service independently of its option.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "option_id", nullable = false)
    @ToString.Exclude
    private ServiceOption option;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime sessionTime;

    @Column(nullable = false)
    private Integer people;

    /**
     * Price snapshot at booking time. The option price can change later, but
     * the customer must be charged the amount they saw when booking.
     * Null means the option is priced on request.
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal unitPriceMad;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalPriceMad;

    /**
     * Customer details are derived from this user instead of being copied
     * into every booking row.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
