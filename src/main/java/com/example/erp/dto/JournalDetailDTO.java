package com.example.erp.dto;

import java.math.BigDecimal;

public class JournalDetailDTO {
    private Long accountId;
    private BigDecimal debit;
    private BigDecimal credit;

    public Long getAccountId() {
        return accountId;
    }
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public BigDecimal getDebit() {
        return debit;
    }
    public void setDebit(BigDecimal debit) {
        this.debit = debit;
    }

    public BigDecimal getCredit() {
        return credit;
    }
    public void setCredit(BigDecimal credit) {
        this.credit = credit;
    }
}
