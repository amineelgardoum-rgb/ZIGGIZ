package com.ziggiz.backend.repository;

import com.ziggiz.backend.model.SurfService;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SurfServiceRepository extends JpaRepository<SurfService, Long> {

    /**
     * Service responses contain their options. Fetch both in one query
     * instead of one additional query per service (N+1).
     */
    @Override
    @EntityGraph(attributePaths = "options")
    List<SurfService> findAll();

    @Override
    @EntityGraph(attributePaths = "options")
    Optional<SurfService> findById(Long id);

    Optional<SurfService> findByName(String name);
}
