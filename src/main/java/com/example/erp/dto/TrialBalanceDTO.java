package com.example.erp.dto;

import java.math.BigDecimal;

public class TrialBalanceDTO {
	private String AccountCode;
	private String AccountName;
	private Long parentId;
	private BigDecimal balance;
	
	public TrialBalanceDTO(String AccountCode, String AccountName, Long parentId, BigDecimal debitSum, BigDecimal creditSum) {
        this.AccountCode = AccountCode;
        this.AccountName = AccountName;
        this.parentId = parentId;
        this.balance = debitSum.subtract(creditSum); 
    }
	
	public String getAccountCode() {
		return AccountCode;
	}
	public void setAccountCode(String accountCode) {
		AccountCode = accountCode;
	}
	public String getAccountName() {
		return AccountName;
	}
	public void setAccountName(String accountName) {
		AccountName = accountName;
	}

	 public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }


	public BigDecimal getBalance() {
		return balance;
	}

	public void setBalance(BigDecimal balance) {
		this.balance = balance;
	}
	
	

}
