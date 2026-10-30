package com.ziggiz.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "services")
@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SurfService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Bookings identify a service by name, so the name must be unique.
     */
    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    private String image;

    /**
     * Whether a booking for this service must specify a session time.
     * Keeps the business rule in the model instead of hardcoding service
     * names in the frontend.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean requiresTime = false;

    /**
     * LAZY here; services are fetched together with their options through an
     * entity graph when the API returns a list. EAGER caused one query per
     * service (N+1).
     */
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<ServiceOption> options = new ArrayList<>();
}
