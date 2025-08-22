package com.example.erp.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.dto.ClosePeriodRequest;
import com.example.erp.service.ClosePeriodService;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/close-period")
public class ClosePeriodController {
	
	private ClosePeriodService cps ;
	
	 public ClosePeriodController(ClosePeriodService cps) {
	        this.cps = cps;
	    }
	
	@PostMapping
	public ResponseEntity<?> closePeriod(@RequestBody ClosePeriodRequest request) {
	    cps.closePeriod(request.getStartDate(), request.getEndDate());
	    return ResponseEntity.ok(Map.of("message", "結帳成功"));
	}

}
