package com.example.erp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PrepaidExpenseRequest {
	    private LocalDate entryDate;          // 入帳日期
	    private String expenseType;           // 預付費用類型（字串即可，純標籤）
	    private String expenseName;           // 預付費用名稱（顯示/摘要）

	    private String creditAccountCode;     // 對應貸方科目（現金/應付帳款等）➡ 原始分錄用
	    private String amortizeExpenseCode;   // 每期攤提科目（ex: 保險費用）➡ 之後每期的借方

	    private BigDecimal amount;            // 金額（總額）
	    private Integer usageMonth;           // 使用月
	    private String description;           // 摘要
		public LocalDate getEntryDate() {
			return entryDate;
		}
		public void setEntryDate(LocalDate entryDate) {
			this.entryDate = entryDate;
		}
		public String getExpenseType() {
			return expenseType;
		}
		public void setExpenseType(String expenseType) {
			this.expenseType = expenseType;
		}
		public String getExpenseName() {
			return expenseName;
		}
		public void setExpenseName(String expenseName) {
			this.expenseName = expenseName;
		}
		public String getCreditAccountCode() {
			return creditAccountCode;
		}
		public void setCreditAccountCode(String creditAccountCode) {
			this.creditAccountCode = creditAccountCode;
		}
		
		public String getAmortizeExpenseCode() {
			return amortizeExpenseCode;
		}
		public void setAmortizeExpenseCode(String amortizeExpenseCode) {
			this.amortizeExpenseCode = amortizeExpenseCode;
		}
		public BigDecimal getAmount() {
			return amount;
		}
		public void setAmount(BigDecimal amount) {
			this.amount = amount;
		}
		public Integer getUsageMonth() {
			return usageMonth;
		}
		public void setUsageMonth(Integer usageMonth) {
			this.usageMonth = usageMonth;
		}
		public String getDescription() {
			return description;
		}
		public void setDescription(String description) {
			this.description = description;
		}
	    
	    

}
