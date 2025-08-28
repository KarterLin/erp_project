package com.example.erp.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.payload.response.ApiResponse;
import com.example.erp.security.CustomUserDetails;


@RestController
@RequestMapping("/api")
public class ReadUserController {
	
	@GetMapping("/me")
	public ResponseEntity<ApiResponse> getMe(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Map<String, Object> data = new HashMap<>();
        data.put("email", userDetails.getUsername());
        data.put("roles", userDetails.getAuthorities()
                .stream()
                .map(a -> a.getAuthority())
                .toList());

        return ResponseEntity.ok(ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("使用者資訊取得成功")
                .timestamp(Instant.now())
                .data(data)
                .build());
    }
}
