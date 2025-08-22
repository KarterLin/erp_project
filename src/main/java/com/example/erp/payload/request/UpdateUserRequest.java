package com.example.erp.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {
	@NotBlank(message = "account is required")
	@Size(min = 4, max = 20, message = "account length must be between 4 and 20 characters")
	@JsonProperty("uAccount")
	private String uAccount;
	@NotNull
	@JsonProperty("status")
	private Integer status;

}
