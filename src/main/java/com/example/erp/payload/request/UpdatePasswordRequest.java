package com.example.erp.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;

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
public class UpdatePasswordRequest {
	@NotNull
	private String oldPassword;
	@NotBlank(message = "password is required")
    @Size(min = 8, message = "password must be at least 8 characters")
	private String password;
	@NotNull
	private String checkPassword;
}
