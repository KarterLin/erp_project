package com.example.erp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale.Category;

public class AmortizationScheduleRequest {
    private Long journalDetailId; // 原始分錄的明細 ID（用來抓出資產科目）
    
    private String assetName; // 資產名稱（資訊設備、保險費等）

    private LocalDate startDate; // 攤提開始日期
    private Integer periodInMonths; // 共攤提幾個月
    
    private BigDecimal totalAmount; // 總金額（攤提總額）

    private String creditAccountCode;

	private String debitAccountCode; // 使用者選的「借方」費用科目（像保險費用）
    
    private Category category; // 類別：固定資產、無形資產、預付費用（用 enum 控制）

    public String getCreditAccountCode() {
    	return creditAccountCode;
    }
    
    public void setCreditAccountCode(String creditAccountCode) {
    	this.creditAccountCode = creditAccountCode;
    }
    
	public Long getJournalDetailId() {
		return journalDetailId;
	}

	public void setJournalDetailId(Long journalDetailId) {
		this.journalDetailId = journalDetailId;
	}

	public String getAssetName() {
		return assetName;
	}

	public void setAssetName(String assetName) {
		this.assetName = assetName;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public Integer getPeriodInMonths() {
		return periodInMonths;
	}

	public void setPeriodInMonths(Integer periodInMonths) {
		this.periodInMonths = periodInMonths;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getDebitAccountCode() {
		return debitAccountCode;
	}

	public void setDebitAccountCode(String debitAccountCode) {
		this.debitAccountCode = debitAccountCode;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}
    
    


}
