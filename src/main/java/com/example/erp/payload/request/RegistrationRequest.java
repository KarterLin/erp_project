package com.example.erp.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationRequest {
	@NotBlank(message = "companyname is required")
	private String cName;  
	@NotBlank(message = "taxId is required")
	private String taxId;
	@NotBlank(message = "representative name is required")
	private String rName;
	@NotBlank(message = "representative tel is required")
	@Pattern(regexp = "^[0-9\\-]{6,15}$", message = "invalid phone number")
	private String rTel;
	@NotBlank(message = "account is required")
	@Size(min = 4, max = 20, message = "account length must be between 4 and 20 characters")
	private String uAccount;
	@NotBlank(message = "email is required")
    @Email(message = "invalid email format")
	private String uEmail;
    @NotBlank(message = "password is required")
    @Size(min = 8, message = "password must be at least 8 characters")
	private String password;
	@NotNull
	private String role;
	private Integer status;
	
	
	public String getcName() {
		return cName;
	}
	public void setcName(String cName) {
		this.cName = cName;
	}
	public String getrName() {
		return rName;
	}
	public void setrName(String rName) {
		this.rName = rName;
	}
	public String getrTel() {
		return rTel;
	}
	public void setrTel(String rTel) {
		this.rTel = rTel;
	}
	public String getuAccount() {
		return uAccount;
	}
	public void setuAccount(String uAccount) {
		this.uAccount = uAccount;
	}
	public String getuEmail() {
		return uEmail;
	}
	public void setuEmail(String uEmail) {
		this.uEmail = uEmail;
	}
	
	
	
}
