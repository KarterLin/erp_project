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
 
    public String sendVerificationEmail(String to, Long cId, String taxId) {
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
            StringBuilder content = new StringBuilder();
            content.append("<p>您好，</p>")
                   .append("<p>請點擊以下連結完成驗證：</p>")
                   .append("<p><a href=\"").append(verificationUrl).append("\">驗證帳號</a></p>");
            if (taxId != null && taxId.startsWith("A")) {
                content.append("<br><p><b>系統已為您分配臨時公司統編：</b> ")
                       .append(taxId)
                       .append("</p>")
                       .append("<p>請妥善保存此統編。</p>");
            }           
            content.append("<br><p>如果您沒有註冊帳號，請忽略這封信。</p>");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content.toString(), true); // true 表示 HTML 格式

            mailSender.send(message);
            System.out.println("驗證信寄出成功！");
            
            return token;
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("寄送驗證信失敗", e);
        }
    } 
    // 普通驗證
    public String validateEmail(String to, Long cId) {
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
            StringBuilder content = new StringBuilder();
            content.append("<p>您好，</p>")
                   .append("<p>請點擊以下連結完成驗證：</p>")
                   .append("<p><a href=\"").append(verificationUrl).append("\">驗證帳號</a></p>");         
            content.append("<br><p>如果您沒有註冊帳號，請忽略這封信。</p>");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content.toString(), true); // true 表示 HTML 格式

            mailSender.send(message);
            System.out.println("驗證信寄出成功！");
            
            return token;
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("寄送驗證信失敗", e);
        }
    } 
    
   // 密碼重設(待修)
    public String sendPasswordEmail(String to, Long cId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            
            // token
    		String rawToken = UUID.randomUUID().toString().replace("-", "");
    		// cId 固定補滿 8 碼
            String paddedCId = String.format("%08d", cId);
         // 最後的 token = uuid + "_" + paddedCId
            String token = rawToken+ paddedCId;
            String subject = "密碼重設";
            String content = "<p>您好，</p>"
                    + "<p>請點擊以下連結完成驗證：</p>"
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
