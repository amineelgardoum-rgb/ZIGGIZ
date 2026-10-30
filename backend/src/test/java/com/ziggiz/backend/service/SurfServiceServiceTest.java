package com.ziggiz.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ziggiz.backend.dto.ServiceOptionResponse;
import com.ziggiz.backend.dto.ServiceResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration coverage for the service catalogue exposed by GET /api/services.
 * These tests rely on the seeded in-memory H2 database.
 */
@SpringBootTest
class SurfServiceServiceTest {

    @Autowired
    private SurfServiceService surfServiceService;

    @Test
    @DisplayName("excursion options expose their own departure times")
    void getAllServices_excursionsExposeDepartureTimes() {
        ServiceResponse excursions = findService("Excursions");

        assertTrue(excursions.isRequiresTime());
        assertEquals("/images/activities/activitie1.jpeg", excursions.getImage());
        assertEquals(13, excursions.getOptions().size());

        assertEquals(List.of("10:00", "15:00"), findOption(excursions, "Agadir Tour").getTimes());
        assertEquals(List.of("09:10"), findOption(excursions, "Paradise Valley").getTimes());
        assertEquals(List.of("04:15"), findOption(excursions, "Hot Air Ballooning").getTimes());
        assertEquals(List.of("10:00", "12:00", "14:00", "16:00"),
                findOption(excursions, "Camel Riding").getTimes());

        assertEquals(new BigDecimal("300.00"), findOption(excursions, "Agadir Tour").getPriceMad());
        assertEquals(new BigDecimal("2500.00"), findOption(excursions, "Hot Air Ballooning").getPriceMad());
    }

    @Test
    @DisplayName("retreat options are bookable with price on request and no fixed times")
    void getAllServices_retreatsHaveNoTimesAndNoPrice() {
        ServiceResponse retreats = findService("Surf Retreats");

        assertFalse(retreats.isRequiresTime());
        assertEquals(3, retreats.getOptions().size());
        for (ServiceOptionResponse option : retreats.getOptions()) {
            assertNull(option.getPriceMad(), "Retreat price should be on request");
            assertNull(option.getTimes(), "Retreats should not expose departure slots");
        }
    }

    @Test
    @DisplayName("existing options keep null times so frontend defaults are unchanged")
    void getAllServices_existingOptionsHaveNoTimes() {
        for (String serviceName : List.of("Surf Lessons", "Quad Trips", "Boat Trips", "Surf Hostel")) {
            for (ServiceOptionResponse option : findService(serviceName).getOptions()) {
                assertNull(option.getTimes(), serviceName + " / " + option.getName() + " should have no times");
            }
        }
    }

    @Test
    @DisplayName("times serialize to the documented JSON array shape")
    void serviceOptionResponse_serializesTimesAsArray() throws Exception {
        ServiceOptionResponse option = findOption(findService("Excursions"), "Agadir Tour");

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode json = objectMapper.readTree(objectMapper.writeValueAsString(option));

        assertTrue(json.get("times").isArray());
        assertEquals("10:00", json.get("times").get(0).asText());
        assertEquals("15:00", json.get("times").get(1).asText());
        assertEquals("Agadir Tour", json.get("name").asText());
        assertEquals(300.00, json.get("priceMad").asDouble(), 0.001);
    }

    private ServiceResponse findService(String name) {
        return surfServiceService.getAllServices().stream()
                .filter(service -> service.getName().equals(name))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing service: " + name));
    }

    private ServiceOptionResponse findOption(ServiceResponse service, String name) {
        return service.getOptions().stream()
                .filter(option -> option.getName().equals(name))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing option: " + name));
    }
}
