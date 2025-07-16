package com.example.erp.dto;

import java.math.BigDecimal;

/**
 * DTO for displaying voucher details.
 */
public class VoucherDTO {
    private String voucherNumber; // 傳票編號
    private String accountName;   // 科目名稱
    private String accountCode;   // 科目編號
    private BigDecimal debitAmount;  // 借方金額
    private BigDecimal creditAmount; // 貸方金額
    private String summary;       // 摘要

    public VoucherDTO() {
    }

    public VoucherDTO(String voucherNumber,
                       String accountName,
                       String accountCode,
                       BigDecimal debitAmount,
                       BigDecimal creditAmount,
                       String summary) {
        this.voucherNumber = voucherNumber;
        this.accountName = accountName;
        this.accountCode = accountCode;
        this.debitAmount = debitAmount;
        this.creditAmount = creditAmount;
        this.summary = summary;
    }
    
    public String getVoucherNumber() {
        return voucherNumber;
    }

    public void setVoucherNumber(String voucherNumber) {
        this.voucherNumber = voucherNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAccountCode() {
        return accountCode;
    }

    public void setAccountCode(String accountCode) {
        this.accountCode = accountCode;
    }

    public BigDecimal getDebitAmount() {
        return debitAmount;
    }

    public void setDebitAmount(BigDecimal debitAmount) {
        this.debitAmount = debitAmount;
    }

    public BigDecimal getCreditAmount() {
        return creditAmount;
    }

    public void setCreditAmount(BigDecimal creditAmount) {
        this.creditAmount = creditAmount;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}