package com.example.erp.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.payload.request.AddUserRequest;
import com.example.erp.service.AddUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/new")
@RequiredArgsConstructor
public class AddUserController {
	private final AddUserService newUserService;
	
	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Map<String, String>> EmailVerified(@RequestBody AddUserRequest request) {	
		
		newUserService.newUser(request);
				
		Map<String, String> res = new HashMap<>();
		res.put("status", "0");
		res.put("message", "帳號新增成功，請查收驗證信。");
		
		return ResponseEntity.status(HttpStatus.CREATED).body(res);
	}
	
}
