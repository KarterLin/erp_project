package com.example.erp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

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
    
    // 新增欄位
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate voucherDate; // 日期
    private String remarks;        // 備註  
    private String description;    // 摘要
    private BigDecimal balance;    // 餘額

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
    
    // 新增包含日期的建構子
    public VoucherDTO(String voucherNumber,
            String accountName,
            String accountCode,
            BigDecimal debitAmount,
            BigDecimal creditAmount,
            String summary,
            LocalDate voucherDate) {
        this.voucherNumber = voucherNumber;
        this.accountName = accountName;
        this.accountCode = accountCode;
        this.debitAmount = debitAmount;
        this.creditAmount = creditAmount;
        this.summary = summary;
        this.voucherDate = voucherDate;
    }

    // Getters and Setters
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

    public LocalDate getVoucherDate() {
        return voucherDate;
    }

    public void setVoucherDate(LocalDate voucherDate) {
        this.voucherDate = voucherDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getDescription() {
        return description != null ? description : summary;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}