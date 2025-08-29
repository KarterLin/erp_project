package com.example.erp.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.payload.request.UpdatePasswordRequest;
import com.example.erp.payload.request.UpdateUserByAdminRequest;
import com.example.erp.payload.request.UpdateUserRequest;
import com.example.erp.payload.response.ApiResponse;
import com.example.erp.service.UserUpdateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/update")
@RequiredArgsConstructor
public class UserUpdateController {
	private final UserUpdateService updateService;
	
	@PostMapping("/me")
	public ResponseEntity<ApiResponse<?>> updateOwnProfile(@RequestBody UpdateUserRequest request) {	
		return updateService.userUpdate(request);
	}
	
	@PostMapping("/byAdmin")
	public ResponseEntity<ApiResponse<?>> updateUserByAdmin(@RequestBody UpdateUserByAdminRequest request) {	
		return updateService.userUpdateByAdmin(request);
	}
	
	@PostMapping("/me/password")
	public ResponseEntity<ApiResponse<?>> updatePassword(@RequestBody UpdatePasswordRequest request) {	
		return updateService.passwordUpdate(request);
	}
	
}
