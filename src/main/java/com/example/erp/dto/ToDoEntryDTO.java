package com.example.erp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 待辦分錄DTO，用於顯示分組後的傳票資訊
 */
public class ToDoEntryDTO {
    
    @JsonFormat(pattern = "yyyy/MM/dd")
    private LocalDate entryDate;        // 日期
    
    private String voucherNumber;       // 傳票編號
    private String status;              // 審核狀態
    private String inputUser;           // 輸入人員 (從 user_info.account 取得)
    private String reason;              // 審核原因
    private List<ToDoDetailDTO> details; // 分錄詳情列表

    // Constructors
    public ToDoEntryDTO() {}

    public ToDoEntryDTO(LocalDate entryDate, String voucherNumber, String status) {
        this.entryDate = entryDate;
        this.voucherNumber = voucherNumber;
        this.status = status;
    }

    public ToDoEntryDTO(LocalDate entryDate, String voucherNumber, String status, String inputUser, String reason) {
        this.entryDate = entryDate;
        this.voucherNumber = voucherNumber;
        this.status = status;
        this.inputUser = inputUser;
        this.reason = reason;
    }

    // Getters and Setters
    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public String getVoucherNumber() {
        return voucherNumber;
    }

    public void setVoucherNumber(String voucherNumber) {
        this.voucherNumber = voucherNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInputUser() {
        return inputUser;
    }

    public void setInputUser(String inputUser) {
        this.inputUser = inputUser;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public List<ToDoDetailDTO> getDetails() {
        return details;
    }

    public void setDetails(List<ToDoDetailDTO> details) {
        this.details = details;
    }

    /**
     * 內部類：分錄詳情
     */
    public static class ToDoDetailDTO {
        private String accountCode;      // 科目代碼
        private String accountName;      // 科目名稱
        private BigDecimal debitAmount;  // 借方金額
        private BigDecimal creditAmount; // 貸方金額
        private String description;      // 摘要

        // Constructors
        public ToDoDetailDTO() {}

        public ToDoDetailDTO(String accountCode, String accountName, 
                           BigDecimal debitAmount, BigDecimal creditAmount, 
                           String description) {
            this.accountCode = accountCode;
            this.accountName = accountName;
            this.debitAmount = debitAmount;
            this.creditAmount = creditAmount;
            this.description = description;
        }

        // Getters and Setters
        public String getAccountCode() {
            return accountCode;
        }

        public void setAccountCode(String accountCode) {
            this.accountCode = accountCode;
        }

        public String getAccountName() {
            return accountName;
        }

        public void setAccountName(String accountName) {
            this.accountName = accountName;
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

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}