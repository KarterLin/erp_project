package com.example.erp.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.erp.dto.BalanceSheetDTO;
import com.example.erp.repository.BalanceSheetRepository;

@Service
public class BalanceSheetService {

    private final BalanceSheetRepository balanceSheetRepository;

    // 手動寫建構子，注入 repository
    public BalanceSheetService(BalanceSheetRepository balanceSheetRepository) {
        this.balanceSheetRepository = balanceSheetRepository;
    }

    public List<BalanceSheetDTO> getParentBalances() {
        List<Object[]> results = balanceSheetRepository.findParentBalances();
        List<BalanceSheetDTO> dtoList = new ArrayList<>();

        for (Object[] row : results) {
            Long parentId = ((Number) row[0]).longValue();
            BigDecimal balance = (BigDecimal) row[1];

            // parentName 我們先不直接抓，等下加 JOIN 或用另一個查詢
            dtoList.add(new BalanceSheetDTO(parentId, null, balance));
        }

        return dtoList;
    }
}
