package com.example.erp.service;

import java.util.UUID;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
	
    private final JavaMailSender mailSender;
	private final UserInfoService userService;
	private final CompanyInfoService companyService;

    public EmailService(JavaMailSender mailSender, UserInfoService userService, CompanyInfoService companyService) {
        this.mailSender = mailSender;
        this.userService = userService;
        this.companyService = companyService;
    }
    
	@Transactional
    public void assignCompany(String uEmail) {
		Long cId = companyService.getCId(uEmail);
		try {
			userService.updateCompanyId(uEmail, cId);
		} catch (Exception e) {
            System.out.println(e);
        }
    }
    
    public String sendVerificationEmail(String to) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            
            // token
    		String token = UUID.randomUUID().toString();
            String subject = "帳號驗證信";
            String verificationUrl = "http://localhost:8080/api/register/confirm/" +token;
            String content = "<p>您好，</p>"
                    + "<p>請點擊以下連結完成驗證：</p>"
                    + "<p><a href=\"" + verificationUrl + "\">驗證帳號</a></p>"
                    + "<br><p>如果您沒有註冊帳號，請忽略這封信。</p>";

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true 表示 HTML 格式

            mailSender.send(message);
            System.out.println("驗證信寄出成功！");
            
            return token;
            
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("寄送驗證信失敗", e);
        }
    }
	
}
