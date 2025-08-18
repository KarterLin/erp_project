package com.example.erp.dto;

import java.math.BigDecimal;

public class BalanceSheetDTO {
    private Long parentId;
    private String parentName;
    private BigDecimal balance;

    public BalanceSheetDTO(Long parentId, String parentName, BigDecimal balance) {
        this.parentId = parentId;
        this.parentName = parentName;
        this.balance = balance != null ? balance : BigDecimal.ZERO;
    }

    // --- getters & setters ---
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance != null ? balance : BigDecimal.ZERO; }
}
