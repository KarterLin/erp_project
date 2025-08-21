package com.example.erp.security.handler;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@lombok.Builder
public class ErrorResponse {
	private int status; 
	private String error; 
	private Instant timestamp; 
	private String message; 
	private String path;
	
}

