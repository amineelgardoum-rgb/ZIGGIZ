package com.ziggiz.backend.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        if ("Unauthorized".equals(message)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "Unauthorized"));
        }
        if ("Admin access required".equals(message)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("ok", false, "error", "Admin access required"));
        }
        return ResponseEntity.badRequest()
                .body(Map.of("ok", false, "error", message != null ? message : "An error occurred"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String message = "A constraint was violated. Please check your input.";
        if (ex.getMessage() != null && ex.getMessage().contains("UK_")) {
            message = "An account with this email already exists.";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("ok", false, "error", message));
    }
}
