package com.ziggiz.backend.repository;

import com.ziggiz.backend.model.ServiceOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceOptionRepository extends JpaRepository<ServiceOption, Long> {
    List<ServiceOption> findByServiceId(Long serviceId);
}
