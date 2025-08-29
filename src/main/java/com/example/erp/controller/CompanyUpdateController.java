package com.example.erp.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.payload.request.UpdateCompanyInfoRequest;
import com.example.erp.payload.response.ApiResponse;
import com.example.erp.payload.response.CompanyInfoResponse;
import com.example.erp.service.UpdateCompanyInfoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyUpdateController {
	private final UpdateCompanyInfoService updateService;
	
	@PostMapping("/update")
	public ResponseEntity<ApiResponse<?>> updateCompany(@RequestBody UpdateCompanyInfoRequest request) {	
		return ResponseEntity.ok(updateService.companyUpdate(request));
	}
	
	@GetMapping("/info")
    public ResponseEntity<ApiResponse<CompanyInfoResponse>> getCompanyInfo() {
        return ResponseEntity.ok(updateService.getCompanyInfo());
    }
	
}
