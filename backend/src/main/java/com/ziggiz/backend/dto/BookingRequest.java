package com.ziggiz.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotBlank(message = "Service is required")
    private String service;

    @NotBlank(message = "Option is required")
    private String option;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date cannot be in the past")
    private LocalDate date;

    private String time;

    @NotNull(message = "Number of people is required")
    @Min(value = 1, message = "At least 1 person required")
    @Max(value = 10, message = "Maximum 10 people allowed")
    private Integer people;

    @NotBlank(message = "Name is required")
    @Size(min = 2, message = "Name must be at least 2 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String message;
}
