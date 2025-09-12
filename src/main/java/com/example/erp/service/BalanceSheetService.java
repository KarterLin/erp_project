package com.example.erp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.erp.dto.BalanceSheetDTO;
import com.example.erp.dto.BalanceSheetSummaryDTO;
import com.example.erp.repository.BalanceSheetRepository;

@Service
public class BalanceSheetService {

    private final BalanceSheetRepository balanceSheetRepository;
    private final IncomeStatementService incomeStatementService;

    public BalanceSheetService(BalanceSheetRepository balanceSheetRepository,
                               IncomeStatementService incomeStatementService) {
        this.balanceSheetRepository = balanceSheetRepository;
        this.incomeStatementService = incomeStatementService;
    }

    public BalanceSheetSummaryDTO getBalanceSheet(LocalDate startDate, LocalDate endDate) {
        // 取得已審核的分錄資料
        List<Object[]> results = balanceSheetRepository.findParentBalancesByDateRange(startDate, endDate);
        List<BalanceSheetDTO> dtoList = new ArrayList<>();

        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        BigDecimal totalEquity = BigDecimal.ZERO;
        BigDecimal currentAssetsTotal = BigDecimal.ZERO;
        BigDecimal nonCurrentAssetsTotal = BigDecimal.ZERO;
        BigDecimal currentLiabilitiesTotal = BigDecimal.ZERO;
        BigDecimal nonCurrentLiabilitiesTotal = BigDecimal.ZERO;
        BigDecimal capitalTotal = BigDecimal.ZERO;
        BigDecimal retainedEarningsTotal = BigDecimal.ZERO;

        for (Object[] row : results) {
            Long parentId = ((Number) row[0]).longValue();
            BigDecimal balance = (BigDecimal) row[1];

            // SQL 查詢已經處理了借貸方向，這裡不需要再調整
            // 但為了保險起見，我們仍然保留原來的邏輯
            
            BalanceSheetDTO dto = new BalanceSheetDTO(parentId, null, balance);
            dtoList.add(dto);

            // 各合計計算
            if (parentId >= 1000 && parentId < 2000) { // 資產
                totalAssets = totalAssets.add(balance);
                if (parentId < 1500) {
                    currentAssetsTotal = currentAssetsTotal.add(balance);
                } else {
                    nonCurrentAssetsTotal = nonCurrentAssetsTotal.add(balance);
                }
            } else if (parentId >= 2000 && parentId < 3000) { // 負債
                totalLiabilities = totalLiabilities.add(balance);
                if (parentId < 2500) {
                    currentLiabilitiesTotal = currentLiabilitiesTotal.add(balance);
                } else {
                    nonCurrentLiabilitiesTotal = nonCurrentLiabilitiesTotal.add(balance);
                }
            } else if (parentId >= 3000 && parentId < 4000 && parentId != 3600) { // 權益 (不含本期損益)
                totalEquity = totalEquity.add(balance);
                if (parentId == 3100) {
                    capitalTotal = capitalTotal.add(balance);
                } else if (parentId >= 3300 && parentId < 3600) {
                    retainedEarningsTotal = retainedEarningsTotal.add(balance);
                }
            }
        }

        // 本期損益：直接從損益表取得，確保只使用已審核的分錄
        BigDecimal netIncome = incomeStatementService.getIncomeStatement(startDate, endDate).getNetIncome();
        if (netIncome != null && netIncome.compareTo(BigDecimal.ZERO) != 0) {
            BalanceSheetDTO netIncomeRow = new BalanceSheetDTO(3600L, "本期損益", netIncome);
            dtoList.add(netIncomeRow);
            totalEquity = totalEquity.add(netIncome);
            retainedEarningsTotal = retainedEarningsTotal.add(netIncome);
        }

        // 回傳 DTO，含各合計
        BalanceSheetSummaryDTO summary = new BalanceSheetSummaryDTO(
            startDate, endDate, totalAssets, totalLiabilities, totalEquity, dtoList
        );
        summary.setCurrentAssetsTotal(currentAssetsTotal);
        summary.setNonCurrentAssetsTotal(nonCurrentAssetsTotal);
        summary.setCurrentLiabilitiesTotal(currentLiabilitiesTotal);
        summary.setNonCurrentLiabilitiesTotal(nonCurrentLiabilitiesTotal);
        summary.setCapitalTotal(capitalTotal);
        summary.setRetainedEarningsTotal(retainedEarningsTotal);

        return summary;
    }

    
}