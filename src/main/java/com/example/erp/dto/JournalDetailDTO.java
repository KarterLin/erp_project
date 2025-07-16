package com.example.erp.dto;

import java.math.BigDecimal;

public class JournalDetailDTO {
	private String AccountCode;

    private BigDecimal debit;
    private BigDecimal credit;

    public String getAccountCode() {
        return AccountCode;
    }
    public void setAccountCode(String accountCode) {
        this.AccountCode = accountCode;
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
