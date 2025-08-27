package com.example.erp.service;

import java.util.UUID;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EmailService {
	
    private final JavaMailSender mailSender;
	private final UserInfoService userService;
   
	@Transactional
    public void assignCompany(String uEmail, String token) {
		try {
			// 從 token 取出最後 8 碼
	        String cIdPart = token.substring(token.length() - 8);
	     // 轉成 Long，自動去掉補的 0，例如 "00001234" -> 1234
	        Long cId = Long.parseLong(cIdPart);
			userService.updateCompanyId(uEmail, cId);
		} catch (Exception e) {
            System.out.println("assignCompany 發生錯誤：" + e.getMessage());
        }
    }
 
    public String sendVerificationEmail(String to, Long cId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            
            // token
    		String rawToken = UUID.randomUUID().toString().replace("-", "");
    		// cId 固定補滿 8 碼
            String paddedCId = String.format("%08d", cId);
         // 最後的 token = uuid + "_" + paddedCId
            String token = rawToken+ paddedCId;
            String subject = "帳號驗證信";
            String verificationUrl = "https://localhost:8443/api/register/confirm/" +token;
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
