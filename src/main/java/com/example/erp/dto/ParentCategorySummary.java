package com.example.erp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ParentCategorySummary {

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal grossProfit;       // 營業毛利
    private BigDecimal operatingIncome;   // 營業淨利
    private BigDecimal preTaxIncome;      // 稅前淨利
    private BigDecimal netIncome;         // 本期淨利
    private List<ParentCategoryAmount> details;

    // Constructor
    public ParentCategorySummary() {}

    public ParentCategorySummary(LocalDate startDate, LocalDate endDate, BigDecimal grossProfit,
                                 BigDecimal operatingIncome, BigDecimal preTaxIncome, BigDecimal netIncome,List<ParentCategoryAmount> details) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.grossProfit = grossProfit;
        this.operatingIncome = operatingIncome;
        this.preTaxIncome = preTaxIncome;
        this.netIncome = netIncome;
        this.details = details;
    }

    // Getter / Setter
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getGrossProfit() { return grossProfit; }
    public void setGrossProfit(BigDecimal grossProfit) { this.grossProfit = grossProfit; }

    public BigDecimal getOperatingIncome() { return operatingIncome; }
    public void setOperatingIncome(BigDecimal operatingIncome) { this.operatingIncome = operatingIncome; }

    public BigDecimal getPreTaxIncome() { return preTaxIncome; }
    public void setPreTaxIncome(BigDecimal preTaxIncome) { this.preTaxIncome = preTaxIncome; }

    public BigDecimal getNetIncome() { return netIncome; }
    public void setNetIncome(BigDecimal netIncome) { this.netIncome = netIncome; }

    public List<ParentCategoryAmount> getDetails() { return details; }
    public void setDetails(List<ParentCategoryAmount> details) { this.details = details; }

}
