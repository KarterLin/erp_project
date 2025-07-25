package com.example.erp.dto;

import java.math.BigDecimal;
import java.util.List;

public class TrialBalanceSummaryDTO {
	private BigDecimal totalDebit;
	private BigDecimal totalCredit;
	private List<TrialBalanceDTO> details;
	
	public TrialBalanceSummaryDTO(BigDecimal totalDebit,BigDecimal totalCredit) {
		this.totalCredit = totalCredit;
		this.totalDebit = totalDebit;
	}
	
	public TrialBalanceSummaryDTO(BigDecimal totalDebit, BigDecimal totalCredit, List<TrialBalanceDTO> details) {
        this.totalDebit = totalDebit;
        this.totalCredit = totalCredit;
        this.details = details;
    }

	public BigDecimal getTotalDebit() {
		return totalDebit;
	}

	public void setTotalDebit(BigDecimal totalDebit) {
		this.totalDebit = totalDebit;
	}

	public BigDecimal getTotalCredit() {
		return totalCredit;
	}

	public void setTotalCredit(BigDecimal totalCredit) {
		this.totalCredit = totalCredit;
	}

	public List<TrialBalanceDTO> getDetails() {
		return details;
	}

	public void setDetails(List<TrialBalanceDTO> details) {
		this.details = details;
	}
	
	

}
