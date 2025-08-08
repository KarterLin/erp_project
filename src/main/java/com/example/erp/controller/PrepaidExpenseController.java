package com.example.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.dto.PrepaidExpenseRequest;
import com.example.erp.service.PrepaidExpenseService;

@RestController
@RequestMapping("/api/prepaid-expenses")
public class PrepaidExpenseController {
	private final PrepaidExpenseService prepaidExpenseService;

    public PrepaidExpenseController(PrepaidExpenseService prepaidExpenseService) {
        this.prepaidExpenseService = prepaidExpenseService;
    }

    // 新增一筆預付費用 + 建立攤提排程
    @PostMapping
    public ResponseEntity<?> create(@Validated @RequestBody PrepaidExpenseRequest request) {
        prepaidExpenseService.createPrepaidAndSchedule(request);
        return ResponseEntity.ok().build();
    }

	
}
