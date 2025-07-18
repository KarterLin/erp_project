package com.example.erp.dto;

import java.math.BigDecimal;

public class TrialBalanceDTO {
	private String AccountCode;
	private String AccountName;
	private BigDecimal balance;
	
	public TrialBalanceDTO(String AccountCode, String AccountName, BigDecimal balance) {
		this.AccountCode = AccountCode;
		this.AccountName = AccountName;
		this.balance = balance;
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
	public BigDecimal getBalance() {
		return balance;
	}
	public void setBalance(BigDecimal balance) {
		this.balance = balance;
	}
	
	

}
