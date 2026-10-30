package com.ziggiz.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(
        name = "service_options",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_service_options_service_name",
                columnNames = {"service_id", "name"}
        )
)
@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String note;

    /**
     * Price per person in Moroccan dirhams. Null means "price on request",
     * so the option cannot be paid online yet.
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal priceMad;

    /**
     * Fixed departure slots as a comma-separated list of "HH:mm" values.
     * Stored in a single column (rather than an @ElementCollection join table)
     * so loading the service list stays a single query. Null/blank means the
     * option has no fixed slots and behaves exactly as before.
     */
    @Column(name = "departure_times")
    private String departureTimes;

    /**
     * Parsed departure slots. Returns an empty list when the option has no
     * fixed times, which keeps the booking validation straightforward.
     */
    public List<String> getTimes() {
        if (departureTimes == null || departureTimes.isBlank()) {
            return List.of();
        }
        return Arrays.stream(departureTimes.split(","))
                .map(String::trim)
                .filter(slot -> !slot.isEmpty())
                .toList();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private SurfService service;
}
