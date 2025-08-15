package com.example.erp.dto;

import java.math.BigDecimal;

public class IncomeStatementSummary {

    private Long parentId;
    private BigDecimal amount;

    // Constructor
    public IncomeStatementSummary(Long parentId, BigDecimal amount) {
        this.parentId = parentId;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
    }

    // Getter / Setter
    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
