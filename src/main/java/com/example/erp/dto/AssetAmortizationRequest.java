package com.example.erp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 固定資產 / 無形資產共用的攤提請求 DTO
 * 對應於 AbstractAmortizationService<AssetAmortizationRequest>
 */
public class AssetAmortizationRequest {

    private LocalDate entryDate;            // 資產入帳日期
    private String assetName;               // 資產名稱（顯示用）

    private String creditAccountCode;       // 貸方帳戶（現金/應付）
    private String assetAccountCode;        // 資產帳戶（借方原始分錄用）
    private String amortizeExpenseCode;     // 每期借方（折舊/攤銷費用）
    private String accumulatedAccountCode;  // 每期貸方（累積折舊/攤銷）

    private BigDecimal amount;              // 資產金額（含殘值）
    private BigDecimal salvageValue;        // 殘值（可為 0）

    private Integer usageYears;             // 使用年限（後端轉換為月）
    private String description;             // 摘要

    // === Getter / Setter ===

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getCreditAccountCode() {
        return creditAccountCode;
    }

    public void setCreditAccountCode(String creditAccountCode) {
        this.creditAccountCode = creditAccountCode;
    }

    public String getAssetAccountCode() {
        return assetAccountCode;
    }

    public void setAssetAccountCode(String assetAccountCode) {
        this.assetAccountCode = assetAccountCode;
    }

    public String getAmortizeExpenseCode() {
        return amortizeExpenseCode;
    }

    public void setAmortizeExpenseCode(String amortizeExpenseCode) {
        this.amortizeExpenseCode = amortizeExpenseCode;
    }

    public String getAccumulatedAccountCode() {
        return accumulatedAccountCode;
    }

    public void setAccumulatedAccountCode(String accumulatedAccountCode) {
        this.accumulatedAccountCode = accumulatedAccountCode;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getSalvageValue() {
        return salvageValue;
    }

    public void setSalvageValue(BigDecimal salvageValue) {
        this.salvageValue = salvageValue;
    }

    public Integer getUsageYears() {
        return usageYears;
    }

    public void setUsageYears(Integer usageYears) {
        this.usageYears = usageYears;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
} 

