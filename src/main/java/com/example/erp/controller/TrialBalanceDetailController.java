package com.example.erp.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.dto.TrialBalanceSummaryDTO;
import com.example.erp.service.TrialBalanceService;

@RestController
@RequestMapping("api/trial-balance")
public class TrialBalanceDetailController {
    
    private final TrialBalanceService tbs;

    public TrialBalanceDetailController(TrialBalanceService tbs) {
        this.tbs = tbs;
    }

    @GetMapping("/{day}")
    public TrialBalanceSummaryDTO getTrialBalance(
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate day) {
        return tbs.getTBSum(day);
    }
}
