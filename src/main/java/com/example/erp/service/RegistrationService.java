package com.example.erp.service;


import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.erp.entity.CompanyInfo;
import com.example.erp.entity.ConfirmationTokens;
import com.example.erp.entity.UserInfo;
import com.example.erp.payload.request.RegistrationRequest;
import com.example.erp.security.enums.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegistrationService {
	private final PasswordEncoder passwordEncoder;
	private final CompanyInfoService companyService;
	private final UserInfoService userService;
	private final EmailService emailService;
	private final ConfirmationTokenService tokenService;
	
	
	@Transactional
	public String register(@RequestBody RegistrationRequest request) {

		if (userService.userExists(request.getuEmail())) {
			throw new IllegalStateException("此信箱已使用");
		}
		if (request.getTaxId() != null && !request.getTaxId().isBlank()) {
			if (companyService.taxIdExists(request.getTaxId())) {
				throw new IllegalStateException("此統編已使用");
			}
		}

		CompanyInfo company = new CompanyInfo();
		company.setcName(request.getcName());
		company.setrName(request.getrName());
		company.setrTel(request.getrTel());
		company.setrEmail(request.getuEmail());
		// 統編
				String taxId = request.getTaxId();
				if (taxId == null || taxId.isBlank()) {
					CompanyInfo savedCompany = companyService.save(company);
					taxId = "A" + String.format("%07d", savedCompany.getId());
					savedCompany.setTaxId(taxId);
					companyService.save(savedCompany);
					company = savedCompany;
				} else {
					company.setTaxId(request.getTaxId());
					companyService.save(company);
				}
		
		UserInfo user = new UserInfo();
		user.setuEmail(request.getuEmail());
		user.setuAccount(request.getuAccount() );
		user.setuPassword(passwordEncoder.encode(request.getPassword()));
		String roleStr = request.getRole();
		Role role = Role.valueOf(roleStr.toUpperCase());
		user.setRole(role);
		//user.setcId(savedCompany.getId()); 
		UserInfo savedUser = userService.save(user);
		
		// 發送驗證信
		String token = emailService.sendVerificationEmail(user.getuEmail(),company.getId(), taxId);
		
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
