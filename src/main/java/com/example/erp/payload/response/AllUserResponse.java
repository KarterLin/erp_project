package com.example.erp.payload.response;

import com.example.erp.entity.UserInfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllUserResponse {
	private Long id;
    private String account;   
    private String email;     
    private String role;      
    private String status;    

    public static AllUserResponse fromEntity(UserInfo  user) {
    	String statusText;
        switch (user.getStatus()) {
            case 1 -> statusText = "啟用";
            case 2 -> statusText = "停用";
            case 0 -> statusText = "未驗證"; // 沒 companyId 原則上不會被撈到
            default -> statusText = "未知";
        }
    	
    	return AllUserResponse.builder()
    			.id(user.getId())
                .account(user.getuAccount())   
                .email(user.getuEmail())
                .role(user.getRole().toString()) 
                .status(statusText) 
                .build();
    }
    
}
