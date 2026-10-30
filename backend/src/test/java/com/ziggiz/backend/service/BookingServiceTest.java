package com.ziggiz.backend.service;

import com.ziggiz.backend.dto.BookingRequest;
import com.ziggiz.backend.dto.BookingResponse;
import com.ziggiz.backend.model.*;
import com.ziggiz.backend.repository.BookingRepository;
import com.ziggiz.backend.repository.ServiceOptionRepository;
import com.ziggiz.backend.repository.SurfServiceRepository;
import com.ziggiz.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * UNIT TESTS FOR BookingService
 * ==============================
 * PHILOSOPHY: Test business logic in isolation using mocks.
 *
 * WHY MOCKS?
 * - BookingService depends on 4 repositories (database access)
 * - We don't want to test the database - we want to test BUSINESS LOGIC
 * - Mocks let us simulate repository behavior without a real database
 *
 * EXAMPLE:
 * - Real: BookingRepository queries H2 database
 * - Mock: "When asked for a booking, return this predefined object"
 *
 * THIS IS CALLED "Integration Testing at the Unit Level":
 * - We test how Service + DTOs + Models work together
 * - But we isolate from infrastructure (database, network, etc.)
 *
 * TEST NAMING: method_name - scenario - expected_behavior
 */
@ExtendWith(MockitoExtension.class) // Enable Mockito annotations
class BookingServiceTest {

    // @Mock creates a fake version of each dependency
    // These are NOT real repositories - they're controlled simulators
    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private SurfServiceRepository surfServiceRepository;

    @Mock
    private ServiceOptionRepository serviceOptionRepository;

    @Mock
    private UserRepository userRepository;

    // @InjectMocks automatically injects our mocks into BookingService
    // This is like Spring's dependency injection, but for tests
    @InjectMocks
    private BookingService bookingService;

    // Test data - reusable across tests
    private SurfService surfService;
    private ServiceOption serviceOption;
    private SurfService hostelService;
    private ServiceOption hostelOption;
    private User existingUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        // Create realistic test data that mirrors production entities
        // This is called "Object Mother" pattern - centralized test data creation

        surfService = SurfService.builder()
                .id(1L)
                .name("Surf Lessons")
                .description("Learn to surf with our expert instructors")
                .requiresTime(true)
                .build();

        serviceOption = ServiceOption.builder()
                .id(1L)
                .name("2-Hour Session")
                .note("Beginner friendly")
                .service(surfService)
                .build();

        hostelService = SurfService.builder()
                .id(2L)
                .name("Surf Hostel")
                .description("Beds steps from the break")
                .requiresTime(false)
                .build();

        hostelOption = ServiceOption.builder()
                .id(2L)
                .name("4-Night Stay")
                .note("Four nights")
                .service(hostelService)
                .build();

        existingUser = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .password("pending")
                .build();

        otherUser = User.builder()
                .id(2L)
                .fullName("Jane Doe")
                .email("jane@example.com")
                .password("pending")
                .build();
    }

    @Nested
    @DisplayName("createBooking() tests")
    class CreateBookingTests {

        @Test
        @DisplayName("should create booking successfully for new user")
        void createBooking_forNewUser_savesAndReturnsBooking() {
            // ARRANGE - Set up mock behavior

            // When repository is asked for "Surf Lessons" service, return our test service
            when(surfServiceRepository.findByName("Surf Lessons"))
                    .thenReturn(Optional.of(surfService));

            // When repository is asked for options of service ID 1, return our test option
            when(serviceOptionRepository.findByServiceIdAndName(1L, "2-Hour Session"))
                    .thenReturn(Optional.of(serviceOption));

            // When checking if time slot exists, return false (no conflict)
            when(bookingRepository.existsByOptionServiceIdAndDateAndSessionTimeAndStatusNot(
                    anyLong(), any(LocalDate.class), any(LocalTime.class), eq(BookingStatus.CANCELLED)))
                    .thenReturn(false);

            // When asked if user exists by email, return empty (new user)
            when(userRepository.findByEmail("john@example.com"))
                    .thenReturn(Optional.empty());

            // When saving user, return the user with an ID (as if DB assigned it)
            when(userRepository.save(any(User.class)))
                    .thenReturn(existingUser);

            // When saving booking, return it with an ID
            Booking savedBooking = Booking.builder()
                    .id(1L)
                    .option(serviceOption)
                    .date(LocalDate.now().plusDays(1))
                    .sessionTime(LocalTime.of(10, 0))
                    .people(2)
                    .user(existingUser)
                    .status(BookingStatus.PENDING)
                    .build();
            when(bookingRepository.save(any(Booking.class)))
                    .thenReturn(savedBooking);

            // Create the request
            BookingRequest request = BookingRequest.builder()
                    .service("Surf Lessons")
                    .option("2-Hour Session")
                    .date(LocalDate.now().plusDays(1))
                    .time("10:00")
                    .people(2)
                    .name("John Doe")
                    .email("john@example.com")
                    .message("Excited to learn!")
                    .build();

            // ACT - Call the method under test
            BookingResponse response = bookingService.createBooking(request);

            // ASSERT - Verify the result
            assertNotNull(response, "Response should not be null");
            assertEquals(1L, response.getId(), "Booking ID should be 1");
            assertEquals("Surf Lessons", response.getServiceName(), "Service name should match");
            assertEquals("2-Hour Session", response.getOptionName(), "Option name should match");
            assertEquals(2, response.getPeople(), "People count should match");
            assertEquals("PENDING", response.getStatus(), "Status should be PENDING");

            // VERIFY - Ensure correct repository methods were called
            // This is crucial - we verify the INTERACTIONS, not just the result
            verify(surfServiceRepository).findByName("Surf Lessons");
            verify(userRepository).save(any(User.class)); // New user was created
            verify(bookingRepository).save(any(Booking.class)); // Booking was saved
        }

        @Test
        @DisplayName("should create booking for existing user without creating new user")
        void createBooking_forExistingUser_doesNotCreateNewUser() {
            // ARRANGE
            when(surfServiceRepository.findByName("Surf Lessons"))
                    .thenReturn(Optional.of(surfService));
            when(serviceOptionRepository.findByServiceIdAndName(1L, "2-Hour Session"))
                    .thenReturn(Optional.of(serviceOption));
            when(bookingRepository.existsByOptionServiceIdAndDateAndSessionTimeAndStatusNot(
                    anyLong(), any(), any(), eq(BookingStatus.CANCELLED)))
                    .thenReturn(false);

            // User already exists in database
            when(userRepository.findByEmail("john@example.com"))
                    .thenReturn(Optional.of(existingUser));

            Booking savedBooking = Booking.builder()
                    .id(1L)
                    .option(serviceOption)
                    .date(LocalDate.now().plusDays(1))
                    .sessionTime(LocalTime.of(10, 0))
                    .people(1)
                    .user(existingUser)
                    .status(BookingStatus.PENDING)
                    .build();
            when(bookingRepository.save(any(Booking.class)))
                    .thenReturn(savedBooking);

            BookingRequest request = BookingRequest.builder()
                    .service("Surf Lessons")
                    .option("2-Hour Session")
                    .date(LocalDate.now().plusDays(1))
                    .time("10:00")
                    .people(1)
                    .name("John Doe")
                    .email("john@example.com")
                    .build();

            // ACT
            bookingService.createBooking(request);

            // ASSERT
            // Verify that userRepository.save() was NEVER called
            // WHY: We don't want to create duplicate users
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("should throw exception when service not found")
        void createBooking_whenServiceNotFound_throwsException() {
            // ARRANGE
            // Repository returns empty - service doesn't exist
            when(surfServiceRepository.findByName("Nonexistent Service"))
                    .thenReturn(Optional.empty());

            BookingRequest request = BookingRequest.builder()
                    .service("Nonexistent Service")
                    .option("Some Option")
                    .date(LocalDate.now().plusDays(1))
                    .people(1)
                    .name("John Doe")
                    .email("john@example.com")
                    .build();

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                bookingService.createBooking(request);
            });

            assertTrue(exception.getMessage().contains("Service not found"),
                    "Exception message should indicate service not found");
        }

        @Test
        @DisplayName("should throw exception when time slot is already booked")
        void createBooking_whenTimeSlotAlreadyBooked_throwsException() {
            // ARRANGE
            when(surfServiceRepository.findByName("Surf Lessons"))
                    .thenReturn(Optional.of(surfService));
            when(serviceOptionRepository.findByServiceIdAndName(1L, "2-Hour Session"))
                    .thenReturn(Optional.of(serviceOption));

            // Time slot conflict - another booking exists
            when(bookingRepository.existsByOptionServiceIdAndDateAndSessionTimeAndStatusNot(
                    anyLong(), any(), any(), eq(BookingStatus.CANCELLED)))
                    .thenReturn(true); // Slot is taken!

            BookingRequest request = BookingRequest.builder()
                    .service("Surf Lessons")
                    .option("2-Hour Session")
                    .date(LocalDate.now().plusDays(1))
                    .time("10:00")
                    .people(1)
                    .name("John Doe")
                    .email("john@example.com")
                    .build();

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                bookingService.createBooking(request);
            });

            assertTrue(exception.getMessage().contains("time slot"),
                    "Exception should mention time slot conflict");
        }

        @Test
        @DisplayName("should reject a departure time outside the option's allowed slots")
        void createBooking_whenTimeNotInOptionSlots_throwsException() {
            // ARRANGE
            serviceOption.setDepartureTimes("10:00,15:00");

            when(surfServiceRepository.findByName("Surf Lessons"))
                    .thenReturn(Optional.of(surfService));
            when(serviceOptionRepository.findByServiceIdAndName(1L, "2-Hour Session"))
                    .thenReturn(Optional.of(serviceOption));

            BookingRequest request = BookingRequest.builder()
                    .service("Surf Lessons")
                    .option("2-Hour Session")
                    .date(LocalDate.now().plusDays(1))
                    .time("11:00")
                    .people(2)
                    .name("John Doe")
                    .email("john@example.com")
                    .build();

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> bookingService.createBooking(request));

            assertEquals("Departure time must be one of: 10:00, 15:00", exception.getMessage());
            verify(bookingRepository, never()).save(any(Booking.class));
        }

        @Test
        @DisplayName("should accept a departure time listed on the option")
        void createBooking_whenTimeIsInOptionSlots_savesBooking() {
            // ARRANGE
            serviceOption.setDepartureTimes("10:00,15:00");

            when(surfServiceRepository.findByName("Surf Lessons"))
                    .thenReturn(Optional.of(surfService));
            when(serviceOptionRepository.findByServiceIdAndName(1L, "2-Hour Session"))
                    .thenReturn(Optional.of(serviceOption));
            when(bookingRepository.existsByOptionServiceIdAndDateAndSessionTimeAndStatusNot(
                    anyLong(), any(), any(), eq(BookingStatus.CANCELLED)))
                    .thenReturn(false);
            when(userRepository.findByEmail("john@example.com"))
                    .thenReturn(Optional.of(existingUser));

            Booking savedBooking = Booking.builder()
                    .id(1L)
                    .option(serviceOption)
                    .date(LocalDate.now().plusDays(1))
                    .sessionTime(LocalTime.of(15, 0))
                    .people(2)
                    .user(existingUser)
                    .status(BookingStatus.PENDING)
                    .build();
            when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

            BookingRequest request = BookingRequest.builder()
                    .service("Surf Lessons")
                    .option("2-Hour Session")
                    .date(LocalDate.now().plusDays(1))
                    .time("15:00")
                    .people(2)
                    .name("John Doe")
                    .email("john@example.com")
                    .build();

            // ACT
            BookingResponse response = bookingService.createBooking(request);

            // ASSERT
            assertEquals("15:00", response.getTime());
            verify(bookingRepository).save(any(Booking.class));
        }

        @Test
        @DisplayName("should reject a timed service without a session time")
        void createBooking_whenTimedServiceHasNoTime_throwsException() {
            // ARRANGE
            when(surfServiceRepository.findByName("Surf Lessons"))
                    .thenReturn(Optional.of(surfService));
            when(serviceOptionRepository.findByServiceIdAndName(1L, "2-Hour Session"))
                    .thenReturn(Optional.of(serviceOption));

            BookingRequest request = BookingRequest.builder()
                    .service("Surf Lessons")
                    .option("2-Hour Session")
                    .date(LocalDate.now().plusDays(1))
                    .time(null)
                    .people(2)
                    .name("John Doe")
                    .email("john@example.com")
                    .build();

            // ACT & ASSERT
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> bookingService.createBooking(request));

            assertTrue(exception.getMessage().contains("session time"),
                    "Exception should explain that a session time is required");
        }

        @Test
        @DisplayName("should handle booking without time (hostel booking)")
        void createBooking_withoutTime_savesBookingWithNullTime() {
            // ARRANGE
            when(surfServiceRepository.findByName("Surf Hostel"))
                    .thenReturn(Optional.of(hostelService));
            when(serviceOptionRepository.findByServiceIdAndName(2L, "4-Night Stay"))
                    .thenReturn(Optional.of(hostelOption));
            when(userRepository.findByEmail("john@example.com"))
                    .thenReturn(Optional.of(existingUser));

            Booking savedBooking = Booking.builder()
                    .id(1L)
                    .option(hostelOption)
                    .date(LocalDate.now().plusDays(1))
                    .sessionTime(null) // No time for hostel
                    .people(2)
                    .user(existingUser)
                    .status(BookingStatus.PENDING)
                    .build();
            when(bookingRepository.save(any(Booking.class)))
                    .thenReturn(savedBooking);

            BookingRequest request = BookingRequest.builder()
                    .service("Surf Hostel")
                    .option("4-Night Stay")
                    .date(LocalDate.now().plusDays(1))
                    .time(null) // No time for hostel
                    .people(2)
                    .name("John Doe")
                    .email("john@example.com")
                    .build();

            // ACT
            BookingResponse response = bookingService.createBooking(request);

            // ASSERT
            assertNull(response.getTime(), "Hostel booking should have null time");
            // Verify time slot check was NOT called (no time provided)
            verify(bookingRepository, never()).existsByOptionServiceIdAndDateAndSessionTimeAndStatusNot(
                    anyLong(), any(), any(), any());
        }
    }

    @Nested
    @DisplayName("getAllBookings() tests")
    class GetAllBookingsTests {

        @Test
        @DisplayName("should return list of all bookings")
        void getAllBookings_whenBookingsExist_returnsList() {
            // ARRANGE
            Booking booking1 = Booking.builder()
                    .id(1L)
                    .option(serviceOption)
                    .date(LocalDate.now())
                    .people(2)
                    .user(existingUser)
                    .status(BookingStatus.PENDING)
                    .build();

            Booking booking2 = Booking.builder()
                    .id(2L)
                    .option(serviceOption)
                    .date(LocalDate.now().plusDays(1))
                    .people(4)
                    .user(otherUser)
                    .status(BookingStatus.CONFIRMED)
                    .build();

            when(bookingRepository.findAll()).thenReturn(Arrays.asList(booking1, booking2));

            // ACT
            List<BookingResponse> bookings = bookingService.getAllBookings();

            // ASSERT
            assertEquals(2, bookings.size(), "Should return 2 bookings");
            assertEquals("John Doe", bookings.get(0).getCustomerName());
            assertEquals("Jane Doe", bookings.get(1).getCustomerName());
        }

        @Test
        @DisplayName("should return empty list when no bookings exist")
        void getAllBookings_whenNoBookings_returnsEmptyList() {
            // ARRANGE
            when(bookingRepository.findAll()).thenReturn(Arrays.asList());

            // ACT
            List<BookingResponse> bookings = bookingService.getAllBookings();

            // ASSERT
            assertNotNull(bookings, "Should not return null");
            assertTrue(bookings.isEmpty(), "Should return empty list");
        }
    }

    @Nested
    @DisplayName("getBookingById() tests")
    class GetBookingByIdTests {

        @Test
        @DisplayName("should return booking when found")
        void getBookingById_whenExists_returnsBooking() {
            // ARRANGE
            Booking booking = Booking.builder()
                    .id(1L)
                    .option(serviceOption)
                    .date(LocalDate.now())
                    .people(2)
                    .user(existingUser)
                    .status(BookingStatus.PENDING)
                    .build();

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            // ACT
            BookingResponse response = bookingService.getBookingById(1L);

            // ASSERT
            assertEquals(1L, response.getId());
            assertEquals("John Doe", response.getCustomerName());
        }

        @Test
        @DisplayName("should throw exception when booking not found")
        void getBookingById_whenNotFound_throwsException() {
            // ARRANGE
            when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

            // ACT & ASSERT
            assertThrows(RuntimeException.class, () -> {
                bookingService.getBookingById(999L);
            });
        }
    }

    @Nested
    @DisplayName("updateBookingStatus() tests")
    class UpdateBookingStatusTests {

        @Test
        @DisplayName("should update status successfully")
        void updateBookingStatus_whenExists_updatesStatus() {
            // ARRANGE
            Booking booking = Booking.builder()
                    .id(1L)
                    .option(serviceOption)
                    .date(LocalDate.now())
                    .people(2)
                    .user(existingUser)
                    .status(BookingStatus.PENDING)
                    .build();

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
            when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

            // ACT
            BookingResponse response = bookingService.updateBookingStatus(1L, BookingStatus.CONFIRMED);

            // ASSERT
            assertEquals("CONFIRMED", response.getStatus());
            assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
        }
    }

    @Nested
    @DisplayName("deleteBooking() tests")
    class DeleteBookingTests {

        @Test
        @DisplayName("should delete booking by id")
        void deleteBooking_whenExists_deletesSuccessfully() {
            // ARRANGE
            // No setup needed - delete just calls repository

            // ACT
            bookingService.deleteBooking(1L);

            // ASSERT
            // Verify that deleteById was called exactly once
            verify(bookingRepository, times(1)).deleteById(1L);
        }
    }
}
