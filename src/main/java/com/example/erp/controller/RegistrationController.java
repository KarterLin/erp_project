package com.example.erp.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.payload.request.RegistrationRequest;
import com.example.erp.service.RegistrationService;




@RestController
@RequestMapping("/api/register")
public class RegistrationController {

	private final RegistrationService registrationService;
	
	public RegistrationController(RegistrationService registrationService) {
		this.registrationService = registrationService;
	}
	
	
	@PostMapping
	public ResponseEntity<Map<String, String>> EmailVerified(@RequestBody RegistrationRequest request) {	
		
		registrationService.register(request);
				
		Map<String, String> res = new HashMap<>();
		res.put("status", "0");
		res.put("message", "註冊成功，請查收驗證信。");
		
		return ResponseEntity.status(HttpStatus.CREATED).body(res);
	}
	
}
