package com.ziggiz.backend.config;

import com.ziggiz.backend.dto.ServiceResponse;
import com.ziggiz.backend.service.SurfServiceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * The seeder must be safe to run against a database that already contains the
 * original four services (H2 is in-memory here, but this mirrors a running DB).
 */
@SpringBootTest
@Transactional
class DataSeederTest {

    @Autowired
    private DataSeeder dataSeeder;

    @Autowired
    private SurfServiceService surfServiceService;

    @Test
    @DisplayName("running the seeder twice does not duplicate services or options")
    void runTwice_doesNotDuplicateServicesOrOptions() {
        dataSeeder.run();

        List<ServiceResponse> afterFirstRun = surfServiceService.getAllServices();
        long serviceCount = afterFirstRun.size();
        long optionCount = totalOptions(afterFirstRun);

        dataSeeder.run();

        List<ServiceResponse> afterSecondRun = surfServiceService.getAllServices();
        assertEquals(serviceCount, afterSecondRun.size(), "Service count must stay stable");
        assertEquals(optionCount, totalOptions(afterSecondRun), "Option count must stay stable");

        assertEquals(1, afterSecondRun.stream()
                .filter(service -> service.getName().equals("Excursions"))
                .count(), "Excursions must exist exactly once");

        ServiceResponse excursions = afterSecondRun.stream()
                .filter(service -> service.getName().equals("Excursions"))
                .findFirst()
                .orElseThrow();
        assertEquals(13, excursions.getOptions().size());
    }

    private long totalOptions(List<ServiceResponse> services) {
        return services.stream().mapToLong(service -> service.getOptions().size()).sum();
    }
}
