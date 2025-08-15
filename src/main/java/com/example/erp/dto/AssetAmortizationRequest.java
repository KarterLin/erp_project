package com.example.erp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 固定資產 / 無形資產共用的攤提請求 DTO
 * 對應於 AbstractAmortizationService<AssetAmortizationRequest>
 */
public class AssetAmortizationRequest {

    private LocalDate entryDate;            // 資產入帳日期
    private String assetAccount;           //無形資產類型（專利權、商標權、電腦軟體）
    private String assetName;               // 名稱
    

    private String creditAccountCode;       // 貸方帳戶（現金/應付）

    private BigDecimal amount;              // 資產金額
    private BigDecimal salvageValue;        // 殘值（可為 0）

    private Integer usageYears;             // 使用年限（後端轉換為月）
    private Integer month;
    private String description;             // 摘要

    // === Getter / Setter ===

    public String getAssetAccount() {
        return assetAccount;
    }

    public void setAssetAccount(String assetAccount) {
        this.assetAccount = assetAccount;
    }

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

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}