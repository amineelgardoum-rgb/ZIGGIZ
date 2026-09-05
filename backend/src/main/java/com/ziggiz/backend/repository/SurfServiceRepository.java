package com.ziggiz.backend.repository;

import com.ziggiz.backend.model.SurfService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SurfServiceRepository extends JpaRepository<SurfService, Long> {
    Optional<SurfService> findByName(String name);
}
