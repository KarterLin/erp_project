package com.example.erp.payload.response;

import java.time.Instant;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse {
	private int status;
    private String message;
    private Instant timestamp;
    
    public static ApiResponse success(String message) {
        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    public static ApiResponse error(String message) {
        return ApiResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}
