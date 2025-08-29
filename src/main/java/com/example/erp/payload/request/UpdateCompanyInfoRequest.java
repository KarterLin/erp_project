package com.example.erp.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCompanyInfoRequest {
	@JsonProperty("cName")
	private String cName;
	@JsonProperty("rName")
	private String rName;
	@JsonProperty("rTel")
	private String rTel;
	@JsonProperty("rEmail")
	private String rEmail;  // 無驗證

}
