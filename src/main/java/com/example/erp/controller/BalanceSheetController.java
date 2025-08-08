package com.example.erp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.entity.Account;
import com.example.erp.service.BalanceSheetService;

@RestController
@RequestMapping("/api/balance-sheet")
public class BalanceSheetController {

    private final BalanceSheetService balanceSheetService;

    public BalanceSheetController(BalanceSheetService balanceSheetService) {
        this.balanceSheetService = balanceSheetService;
    }

    @GetMapping("/assets")
    public List<Account> getUsedAssets() {
        return balanceSheetService.getUsedAssets();
    }
}
