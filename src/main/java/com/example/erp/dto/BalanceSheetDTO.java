package com.example.erp.dto;

import java.math.BigDecimal;

public class BalanceSheetDTO {
    private Long parentId;
    private String parentName;
    private BigDecimal balance;

    public BalanceSheetDTO(Long parentId, String parentName, BigDecimal balance) {
        this.parentId = parentId;
        this.parentName = parentName;
        this.balance = balance;
    }

    public Long getParentId() {
        return parentId;
    }

    public String getParentName() {
        return parentName;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
