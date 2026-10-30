package com.ziggiz.backend.repository;

import com.ziggiz.backend.model.ServiceOption;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServiceOptionRepository extends JpaRepository<ServiceOption, Long> {

    /**
     * Select the requested option directly instead of loading every option
     * of the service and filtering in memory.
     */
    @EntityGraph(attributePaths = "service")
    Optional<ServiceOption> findByServiceIdAndName(Long serviceId, String name);
}
