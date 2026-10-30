package com.ziggiz.backend.controller;

import com.ziggiz.backend.config.JwtUtil;
import com.ziggiz.backend.dto.BookingRequest;
import com.ziggiz.backend.dto.BookingResponse;
import com.ziggiz.backend.model.BookingStatus;
import com.ziggiz.backend.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * UNIT TESTS FOR BookingController
 * ==================================
 * PHILOSOPHY: Test controller logic in isolation using mocks.
 *
 * WHY UNIT TESTS INSTEAD OF @WebMvcTest?
 * - Spring Boot 4.x changed test annotations
 * - Unit tests are FASTER (no Spring context loading)
 * - We test the same thing: request -> controller -> response
 * - MockMvc just adds HTTP layer on top
 *
 * WHAT WE TEST HERE:
 * - Request parsing and validation
 * - Service method delegation
 * - Response structure and status codes
 * - Authentication checks (requireAdmin)
 *
 * APPROACH:
 * - Mock the service layer
 * - Mock the HttpServletRequest (for auth headers)
 * - Call controller methods directly
 * - Verify correct behavior
 */
@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private BookingController bookingController;

    @Mock
    private HttpServletRequest httpRequest;

    private BookingResponse testBookingResponse;
    private BookingRequest testBookingRequest;
    private String validAdminToken;

    @BeforeEach
    void setUp() {
        testBookingResponse = BookingResponse.builder()
                .id(1L)
                .userId(1L)
                .serviceName("Surf Lessons")
                .optionName("2-Hour Session")
                .date(LocalDate.now().plusDays(1))
                .time("10:00")
                .people(2)
                .customerName("John Doe")
                .customerEmail("john@example.com")
                .message("Excited!")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        testBookingRequest = BookingRequest.builder()
                .service("Surf Lessons")
                .option("2-Hour Session")
                .date(LocalDate.now().plusDays(1))
                .time("10:00")
                .people(2)
                .name("John Doe")
                .email("john@example.com")
                .message("Excited!")
                .build();

        validAdminToken = "valid-admin-token";
    }

    @Nested
    @DisplayName("createBooking() tests")
    class CreateBookingTests {

        @Test
        @DisplayName("should create booking and return 201 Created")
        void createBooking_withValidRequest_returns201() {
            // ARRANGE
            when(bookingService.createBooking(any(BookingRequest.class)))
                    .thenReturn(testBookingResponse);

            // ACT
            ResponseEntity<Map<String, Object>> response = bookingController.createBooking(testBookingRequest);

            // ASSERT
            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            assertTrue((Boolean) response.getBody().get("ok"));
            assertNotNull(response.getBody().get("booking"));

            verify(bookingService).createBooking(testBookingRequest);
        }

        @Test
        @DisplayName("should propagate service exceptions")
        void createBooking_whenServiceThrows_propagatesException() {
            // ARRANGE
            when(bookingService.createBooking(any()))
                    .thenThrow(new RuntimeException("Service not found: Surf Lessons"));

            // ACT & ASSERT
            assertThrows(RuntimeException.class, () -> {
                bookingController.createBooking(testBookingRequest);
            });
        }
    }

    @Nested
    @DisplayName("getAllBookings() tests")
    class GetAllBookingsTests {

        @Test
        @DisplayName("should return 200 with bookings when admin token is valid")
        void getAllBookings_withValidAdminToken_returns200() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer " + validAdminToken);
            when(jwtUtil.isValid(validAdminToken)).thenReturn(true);
            when(jwtUtil.getRole(validAdminToken)).thenReturn("ADMIN");

            List<BookingResponse> bookings = Arrays.asList(testBookingResponse);
            when(bookingService.getAllBookings()).thenReturn(bookings);

            // ACT
            ResponseEntity<?> response = bookingController.getAllBookings(httpRequest);

            // ASSERT
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
        }

        @Test
        @DisplayName("should return 401 when no token is provided")
        void getAllBookings_withoutToken_returns401() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn(null);

            // ACT & ASSERT
            assertThrows(RuntimeException.class, () -> {
                bookingController.getAllBookings(httpRequest);
            });
        }

        @Test
        @DisplayName("should return 401 when token is invalid")
        void getAllBookings_withInvalidToken_returns401() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer invalid-token");
            when(jwtUtil.isValid("invalid-token")).thenReturn(false);

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                bookingController.getAllBookings(httpRequest);
            });
            assertTrue(exception.getMessage().contains("Unauthorized"));
        }

        @Test
        @DisplayName("should return 403 when user is not admin")
        void getAllBookings_withClientToken_returns403() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer client-token");
            when(jwtUtil.isValid("client-token")).thenReturn(true);
            when(jwtUtil.getRole("client-token")).thenReturn("CLIENT");

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                bookingController.getAllBookings(httpRequest);
            });
            assertTrue(exception.getMessage().contains("Admin access required"));
        }
    }

    @Nested
    @DisplayName("getBookingById() tests")
    class GetBookingByIdTests {

        @Test
        @DisplayName("should return booking when admin token is valid")
        void getBookingById_withValidAdminToken_returns200() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer " + validAdminToken);
            when(jwtUtil.isValid(validAdminToken)).thenReturn(true);
            when(jwtUtil.getRole(validAdminToken)).thenReturn("ADMIN");
            when(bookingService.getBookingById(1L)).thenReturn(testBookingResponse);

            // ACT
            ResponseEntity<?> response = bookingController.getBookingById(1L, httpRequest);

            // ASSERT
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("updateBookingStatus() tests")
    class UpdateBookingStatusTests {

        @Test
        @DisplayName("should update status when admin token is valid")
        void updateBookingStatus_withValidAdminToken_returns200() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer " + validAdminToken);
            when(jwtUtil.isValid(validAdminToken)).thenReturn(true);
            when(jwtUtil.getRole(validAdminToken)).thenReturn("ADMIN");

            BookingResponse confirmedResponse = BookingResponse.builder()
                    .id(1L)
                    .status("CONFIRMED")
                    .build();
            when(bookingService.updateBookingStatus(eq(1L), eq(BookingStatus.CONFIRMED)))
                    .thenReturn(confirmedResponse);

            Map<String, String> body = Map.of("status", "CONFIRMED");

            // ACT
            ResponseEntity<?> response = bookingController.updateBookingStatus(1L, body, httpRequest);

            // ASSERT
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("deleteBooking() tests")
    class DeleteBookingTests {

        @Test
        @DisplayName("should delete booking and return 204 No Content")
        void deleteBooking_withValidAdminToken_returns204() {
            // ARRANGE
            when(httpRequest.getHeader("Authorization")).thenReturn("Bearer " + validAdminToken);
            when(jwtUtil.isValid(validAdminToken)).thenReturn(true);
            when(jwtUtil.getRole(validAdminToken)).thenReturn("ADMIN");
            doNothing().when(bookingService).deleteBooking(1L);

            // ACT
            ResponseEntity<?> response = bookingController.deleteBooking(1L, httpRequest);

            // ASSERT
            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(bookingService).deleteBooking(1L);
        }
    }
}
