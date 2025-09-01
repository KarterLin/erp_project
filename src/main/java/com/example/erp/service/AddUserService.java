package com.example.erp.service;

import java.time.LocalDateTime;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.erp.entity.ConfirmationTokens;
import com.example.erp.entity.UserInfo;
import com.example.erp.payload.request.AddUserRequest;
import com.example.erp.repository.UserInfoRepository;
import com.example.erp.security.CustomUserDetails;
import com.example.erp.security.enums.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddUserService {
	private final PasswordEncoder passwordEncoder;
	private final UserInfoService userService;
	private final EmailService emailService;
	private final ConfirmationTokenService tokenService;
	private final UserInfoRepository userRepository;
	
	
	@Transactional
	public String newUser(@RequestBody AddUserRequest request) {
		if (userService.userExists(request.getUEmail())) {
			throw new IllegalStateException("此信箱已使用");
		}
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails user = (CustomUserDetails) authentication.getPrincipal();
		String uEmail = user.getUsername();
		Long cId = userRepository.findByUEmail(uEmail).get().getcId();
		
		UserInfo newUser = new UserInfo();
		newUser.setuEmail(request.getUEmail());
		newUser.setuAccount(request.getUAccount() );
		newUser.setuPassword(passwordEncoder.encode("0000"));  // 預設密碼
		newUser.setStatus(0);  // 信箱待驗證
		String roleStr = request.getRole();
		Role role = Role.valueOf(roleStr.toUpperCase());
		newUser.setRole(role);
		UserInfo savedUser = userService.save(newUser);
		
		// 發送驗證信
		String token = emailService.validateEmail(newUser.getuEmail(),cId);
				
		// 記錄Token
		ConfirmationTokens cToken = new ConfirmationTokens();
		cToken.setToken(token);
		cToken.setCreatedAt(LocalDateTime.now());
		cToken.setExpiresAt(LocalDateTime.now().plusMinutes(60));  // 設定60分鐘後token過期
		cToken.setUserId(savedUser.getId());
		tokenService.saveToken(cToken);
		        
		return token;
	}
}
