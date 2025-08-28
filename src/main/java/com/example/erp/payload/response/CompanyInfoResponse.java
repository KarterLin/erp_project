package com.example.erp.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CompanyInfoResponse {
	private String cName;
    private String taxId;
    private String rName;
    private String rTel;
    private String rEmail;
}
