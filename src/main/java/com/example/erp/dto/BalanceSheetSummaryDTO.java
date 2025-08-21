package com.example.erp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 資產負債表總結（和損益表 Summary 結構一致的做法）
 * - top-level: 總計欄位
 * - details: 每個 parentId 的科目金額（對應前端的 data-parent-id）
 */
public class BalanceSheetSummaryDTO {

    private LocalDate startDate;              // 期間起
    private LocalDate endDate;                // 期間迄

    private BigDecimal totalAssets   = BigDecimal.ZERO;  // 資產合計
    private BigDecimal totalLiabilities = BigDecimal.ZERO; // 負債合計
    private BigDecimal totalEquity   = BigDecimal.ZERO;  // 權益合計

    private BigDecimal currentAssetsTotal;      // 流動資產合計
    private BigDecimal nonCurrentAssetsTotal;   // 非流動資產合計
    private BigDecimal currentLiabilitiesTotal; // 流動負債合計
    private BigDecimal nonCurrentLiabilitiesTotal; // 非流動負債合計
    private BigDecimal capitalTotal;            // 股本合計
    private BigDecimal retainedEarningsTotal;   // 保留盈餘合計

    // 明細：每筆含 parentId（例如 1100/1170/2100/3600…）、名稱(可為 null)、金額
    private List<BalanceSheetDTO> details;

    public BalanceSheetSummaryDTO() {}

    public BalanceSheetSummaryDTO(LocalDate startDate,
                                  LocalDate endDate,
                                  BigDecimal totalAssets,
                                  BigDecimal totalLiabilities,
                                  BigDecimal totalEquity,
                                  List<BalanceSheetDTO> details) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalAssets = totalAssets != null ? totalAssets : BigDecimal.ZERO;
        this.totalLiabilities = totalLiabilities != null ? totalLiabilities : BigDecimal.ZERO;
        this.totalEquity = totalEquity != null ? totalEquity : BigDecimal.ZERO;
        this.details = details;
    }

    // --- getters & setters ---

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getTotalAssets() { return totalAssets; }
    public void setTotalAssets(BigDecimal totalAssets) {
        this.totalAssets = totalAssets != null ? totalAssets : BigDecimal.ZERO;
    }

    public BigDecimal getTotalLiabilities() { return totalLiabilities; }
    public void setTotalLiabilities(BigDecimal totalLiabilities) {
        this.totalLiabilities = totalLiabilities != null ? totalLiabilities : BigDecimal.ZERO;
    }

    public BigDecimal getTotalEquity() { return totalEquity; }
    public void setTotalEquity(BigDecimal totalEquity) {
        this.totalEquity = totalEquity != null ? totalEquity : BigDecimal.ZERO;
    }
    public BigDecimal getCurrentAssetsTotal() { return currentAssetsTotal; }
    public void setCurrentAssetsTotal(BigDecimal currentAssetsTotal) {
        this.currentAssetsTotal = currentAssetsTotal != null ? currentAssetsTotal : BigDecimal.ZERO;
    }
    public BigDecimal getNonCurrentAssetsTotal() { return nonCurrentAssetsTotal; }
    public void setNonCurrentAssetsTotal(BigDecimal nonCurrentAssetsTotal) {
        this.nonCurrentAssetsTotal = nonCurrentAssetsTotal != null ? nonCurrentAssetsTotal : BigDecimal.ZERO;
    }
    public BigDecimal getCurrentLiabilitiesTotal() { return currentLiabilitiesTotal; }
    public void setCurrentLiabilitiesTotal(BigDecimal currentLiabilitiesTotal) {
        this.currentLiabilitiesTotal = currentLiabilitiesTotal != null ? currentLiabilitiesTotal : BigDecimal.ZERO;
    }
    public BigDecimal getNonCurrentLiabilitiesTotal() { return nonCurrentLiabilitiesTotal; }
    public void setNonCurrentLiabilitiesTotal(BigDecimal nonCurrentLiabilitiesTotal) {
        this.nonCurrentLiabilitiesTotal = nonCurrentLiabilitiesTotal != null ? nonCurrentLiabilitiesTotal : BigDecimal.ZERO;
    }
    public BigDecimal getCapitalTotal() { return capitalTotal; }
    public void setCapitalTotal(BigDecimal capitalTotal) {
        this.capitalTotal = capitalTotal != null ? capitalTotal : BigDecimal.ZERO;
    }
    public BigDecimal getRetainedEarningsTotal() { return retainedEarningsTotal; }
    public void setRetainedEarningsTotal(BigDecimal retainedEarningsTotal) {
        this.retainedEarningsTotal = retainedEarningsTotal != null ? retainedEarningsTotal : BigDecimal.ZERO;
    }

    public List<BalanceSheetDTO> getDetails() { return details; }
    public void setDetails(List<BalanceSheetDTO> details) { this.details = details; }
}
