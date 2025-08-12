package com.example.erp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.dto.BalanceSheetDTO;
import com.example.erp.service.BalanceSheetService;

@RestController
@RequestMapping("/api/balance-sheet")
public class BalanceSheetController {

    private final BalanceSheetService balanceSheetService;

    public BalanceSheetController(BalanceSheetService balanceSheetService) {
        this.balanceSheetService = balanceSheetService;
    }

    @GetMapping("/summary")
    public List<BalanceSheetDTO> getParentBalances() {
        return balanceSheetService.getParentBalances();
    }
}
