package com.example.erp.dto;

import java.math.BigDecimal;

public class ParentCategoryAmount {

    private final Long parentId;
    private final BigDecimal amount;

    public ParentCategoryAmount(Long parentId, BigDecimal amount) {
        this.parentId = parentId;
        this.amount = amount;
    }

    public Long getParentId() {
        return parentId;
    }

    public BigDecimal getAmount() {
        return amount;
    }
}