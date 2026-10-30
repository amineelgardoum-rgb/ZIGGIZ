package com.ziggiz.backend.repository;

import com.ziggiz.backend.dto.BookingRequest;
import com.ziggiz.backend.dto.BookingResponse;
import com.ziggiz.backend.dto.ReviewResponse;
import com.ziggiz.backend.dto.ServiceResponse;
import com.ziggiz.backend.service.BookingService;
import com.ziggiz.backend.service.ReviewService;
import com.ziggiz.backend.service.SurfServiceService;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Regression tests for the N+1 query problem.
 *
 * A collection of N child rows must not cause N extra SELECTs. The repository
 * entity graphs are expected to fetch each API payload with one query.
 */
@SpringBootTest(properties = {
        "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.jpa.show-sql=false"
})
@Transactional
class QueryCountTest {

    @Autowired
    private SurfServiceService surfServiceService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private EntityManager entityManager;

    private Statistics statistics;

    @BeforeEach
    void setUp() {
        statistics = entityManager.getEntityManagerFactory()
                .unwrap(SessionFactory.class)
                .getStatistics();
        statistics.clear();
    }

    @Test
    @DisplayName("service list loads services and options in one query")
    void getAllServices_usesOneQuery() {
        List<ServiceResponse> services = surfServiceService.getAllServices();

        assertEquals(6, services.size());
        assertEquals(26, services.stream().mapToInt(service -> service.getOptions().size()).sum());
        assertEquals(1L, statistics.getPrepareStatementCount());
    }

    @Test
    @DisplayName("booking list loads option, service and user in one query")
    void getAllBookings_usesOneQuery() {
        createBooking("Surf Lessons", "Adult Lessons", "08:00");
        createBooking("Quad Trips", "Sunset Dune Run", "10:00");
        entityManager.flush();
        entityManager.clear();
        statistics.clear();

        List<BookingResponse> bookings = bookingService.getAllBookings();

        assertEquals(2, bookings.size());
        assertNotNull(bookings.get(0).getCustomerName());
        assertEquals(1L, statistics.getPrepareStatementCount());
    }

    @Test
    @DisplayName("single booking loads its associations in one query")
    void getBookingById_usesOneQuery() {
        Long bookingId = createBooking("Boat Trips", "Snorkel & Hidden Coves", "14:00");
        entityManager.flush();
        entityManager.clear();
        statistics.clear();

        BookingResponse booking = bookingService.getBookingById(bookingId);

        assertNotNull(booking.getServiceName());
        assertNotNull(booking.getCustomerEmail());
        assertEquals(1L, statistics.getPrepareStatementCount());
    }

    @Test
    @DisplayName("review lists load their authors in one query")
    void reviewLists_useOneQueryEach() {
        List<ReviewResponse> displayed = reviewService.getDisplayedReviews();
        assertEquals(3, displayed.size());
        assertEquals(1L, statistics.getPrepareStatementCount());

        statistics.clear();
        List<ReviewResponse> all = reviewService.getAllReviews();
        assertEquals(3, all.size());
        assertEquals(1L, statistics.getPrepareStatementCount());
    }

    private Long createBooking(String service, String option, String time) {
        BookingRequest request = BookingRequest.builder()
                .service(service)
                .option(option)
                .date(LocalDate.now().plusDays(7))
                .time(time)
                .people(2)
                .name("Query Test")
                .email("query-test@example.com")
                .build();

        return bookingService.createBooking(request).getId();
    }
}
