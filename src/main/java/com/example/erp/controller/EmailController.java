package com.example.erp.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.service.ConfirmationTokenService;
import com.example.erp.service.EmailService;
import com.example.erp.service.UserInfoService;



@RestController
@RequestMapping("/api/register")
public class EmailController {
	
	private final ConfirmationTokenService confirmationTokenService;
	private final UserInfoService userService;
	private final EmailService emailService;

	public EmailController(ConfirmationTokenService confirmationTokenService, UserInfoService userService, EmailService emailService) {
        this.confirmationTokenService = confirmationTokenService;
        this.userService = userService;
        this.emailService = emailService;
    }
	
	
	@GetMapping("/confirm/{token}")
	public String EmailVerfied(@PathVariable("token") String token) {
		int updateRows = confirmationTokenService.setConfirmedAt(token);
		
		if (updateRows > 0) {
			String uEmail = confirmationTokenService.getUEmail(token);
			userService.enableUser(uEmail); 
			 emailService.assignCompany(uEmail, token);
			
			return "驗證成功!";
		}else {
			 return "驗證失敗或連結已失效";
		}
		
	}

}
