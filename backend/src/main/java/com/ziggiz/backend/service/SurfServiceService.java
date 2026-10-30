package com.ziggiz.backend.service;

import com.ziggiz.backend.dto.ServiceOptionResponse;
import com.ziggiz.backend.dto.ServiceResponse;
import com.ziggiz.backend.model.SurfService;
import com.ziggiz.backend.repository.SurfServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurfServiceService {

    private final SurfServiceRepository surfServiceRepository;

    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServices() {
        return surfServiceRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(Long id) {
        SurfService surfService = surfServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        return toResponse(surfService);
    }

    private ServiceResponse toResponse(SurfService surfService) {
        List<ServiceOptionResponse> options = surfService.getOptions().stream()
                .map(o -> ServiceOptionResponse.builder()
                        .id(o.getId())
                        .name(o.getName())
                        .note(o.getNote())
                        .priceMad(o.getPriceMad())
                        .times(o.getTimes().isEmpty() ? null : o.getTimes())
                        .build())
                .collect(Collectors.toList());

        return ServiceResponse.builder()
                .id(surfService.getId())
                .name(surfService.getName())
                .description(surfService.getDescription())
                .image(surfService.getImage())
                .requiresTime(surfService.isRequiresTime())
                .options(options)
                .build();
    }
}
