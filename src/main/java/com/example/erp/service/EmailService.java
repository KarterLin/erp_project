package com.example.erp.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.entity.ConfirmationTokens;
import com.example.erp.entity.UserInfo;
import com.example.erp.exception.NotFoundException;
import com.example.erp.payload.response.ApiResponse;
import com.example.erp.repository.UserInfoRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EmailService {
	
    private final JavaMailSender mailSender;
	private final UserInfoService userService;
	private final ConfirmationTokenService tokenService;
	private final UserInfoRepository userRepository;
   
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
    
 // 密碼驗證信
    public ResponseEntity<ApiResponse<?>> sendPasswordEmail(String to) {
    	// 確認 email 是否存在
        UserInfo user = userRepository.findByUEmail(to)
	            .orElseThrow(() -> new NotFoundException("Email 不存在"));
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            
            // token
    		String token = UUID.randomUUID().toString().replace("-", "");
    		
    		ConfirmationTokens cToken = new ConfirmationTokens();
    		cToken.setToken(token);
    		cToken.setCreatedAt(LocalDateTime.now());
    		cToken.setExpiresAt(LocalDateTime.now().plusMinutes(60));  
    		cToken.setUserId(user.getId());
    		tokenService.saveToken(cToken);
    		
    		String resetUrl = "https://127.0.0.1:5500/login.html?token=" + token;
            String subject = "密碼重設";
            StringBuilder content = new StringBuilder();
            content.append("<p>您好，</p>")
                   .append("<p>請點擊以下連結來重設密碼：</p>")
                   .append("<p><a href=\"").append(resetUrl).append("\">重設密碼</a></p>");         
            content.append("<br><p>如果您沒有忘記密碼，請忽略這封信。</p>");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content.toString(), true); // true 表示 HTML 格式

            mailSender.send(message);
            System.out.println("驗證信寄出成功！");
            
            return ResponseEntity.ok(ApiResponse.success("已寄送密碼重設信，請到信箱查看"));
            
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("寄送驗證信失敗", e);
        }
    } 
	
}
