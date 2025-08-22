package com.example.erp.service;


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.entity.UserInfo;
import com.example.erp.exception.PasswordUpdateException;
import com.example.erp.payload.request.UpdatePasswordRequest;
import com.example.erp.payload.request.UpdateUserByAdminRequest;
import com.example.erp.payload.request.UpdateUserRequest;
import com.example.erp.payload.response.ApiResponse;
import com.example.erp.repository.UserInfoRepository;
import com.example.erp.security.CustomUserDetails;
import com.example.erp.security.enums.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserUpdateService {
	private final UserInfoService userService;
	private final UserInfoRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	
	@Transactional
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<ApiResponse> userUpdate(UpdateUserRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails user = (CustomUserDetails) authentication.getPrincipal();
		String uEmail = user.getUsername();
		
		UserInfo newUser = userRepository.findByUEmail(uEmail).get();
		newUser.setuAccount(request.getUAccount() );
		newUser.setStatus(request.getStatus());
		
		UserInfo savedUser = userService.save(newUser);
		        
		return ResponseEntity.ok(ApiResponse.success("資料更新成功！"));
	}
	
	@Transactional
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse> userUpdateByAdmin(UpdateUserByAdminRequest request) {
		
		UserInfo newUser = userRepository.findByUEmail(request.getTEmail()).get();
		newUser.setuAccount(request.getUAccount() );
		String roleStr = request.getRole();
		Role role = Role.valueOf(roleStr.toUpperCase());
		newUser.setRole(role);
		newUser.setStatus(request.getStatus());
		
		UserInfo savedUser = userService.save(newUser);
		        
		return ResponseEntity.ok(ApiResponse.success("資料更新成功！"));
	}
	
	@Transactional
	@PreAuthorize("hasAnyRole('USER','ADMIN')")
	public ResponseEntity<ApiResponse> passwordUpdate(UpdatePasswordRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails user = (CustomUserDetails) authentication.getPrincipal();
		String uEmail = user.getUsername();
		UserInfo newUser = userRepository.findByUEmail(uEmail)
	            .orElseThrow(() -> new PasswordUpdateException("找不到使用者"));
		
		String oldPassword = request.getOldPassword();
		String checkPassword = request.getCheckPassword();
		String newPassword = request.getPassword();
		
		if (!passwordEncoder.matches(oldPassword, newUser.getuPassword())) {
			throw new PasswordUpdateException("舊密碼錯誤");
		}
		if (!newPassword.equals(oldPassword)) {
			throw new PasswordUpdateException("新密碼不可與舊密碼重複");
		}
		if(!checkPassword.equals(newPassword)) {
			throw new PasswordUpdateException("兩次密碼不一致");
		}
		newUser.setuPassword(passwordEncoder.encode(newPassword));
		
		UserInfo savedUser = userService.save(newUser);
		        
		return ResponseEntity.ok(ApiResponse.success("密碼更新成功！"));
	}
	
}
