package com.example.erp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.erp.entity.Account;
import com.example.erp.repository.BalanceSheetRepository;

@Service
public class BalanceSheetService {

    private final BalanceSheetRepository balanceSheetRepository;

    public BalanceSheetService(BalanceSheetRepository balanceSheetRepository) {
        this.balanceSheetRepository = balanceSheetRepository;
    }

    public List<Account> getUsedAssets() {
        return balanceSheetRepository.findUsedAssetAccounts();
    }
}
