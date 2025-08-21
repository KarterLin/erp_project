package com.example.erp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.erp.dto.ParentCategoryAmount;
import com.example.erp.dto.ParentCategorySummary;
import com.example.erp.repository.IncomeStatementRepository;

@Service
public class IncomeStatementService {

    private final IncomeStatementRepository repository;

    public IncomeStatementService(IncomeStatementRepository repository) {
        this.repository = repository;
    }

    public ParentCategorySummary getIncomeStatement(LocalDate startDate, LocalDate endDate) {

    // 從 Repository 取得所有 parentId 的金額
    List<ParentCategoryAmount> rawAmounts = repository.findAmountsByDateRange(startDate, endDate);

    // 先依 parentId 修正正負號
    List<ParentCategoryAmount> amounts = rawAmounts.stream()
        .map(a -> new ParentCategoryAmount(
                a.getParentId(),
                adjustSign(a.getParentId(), a.getAmount())
        ))
        .collect(Collectors.toList());

    // 印出每個 parentId 的金額
    System.out.println("===== Parent Amounts =====");
    amounts.forEach(a -> System.out.println("ParentId: " + a.getParentId() + ", Amount: " + a.getAmount()));

    // 建立 ParentCategorySummary
    ParentCategorySummary summary = new ParentCategorySummary();
    summary.setStartDate(startDate);
    summary.setEndDate(endDate);

    // 計算總計欄位
    BigDecimal grossProfit = calculateGrossProfit(amounts);
    BigDecimal operatingIncome = calculateOperatingIncome(amounts);
    BigDecimal preTaxIncome = calculatePreTaxIncome(amounts);
    BigDecimal netIncome = calculateNetIncome(amounts);

    // 印出計算結果
    System.out.println("GrossProfit: " + grossProfit);
    System.out.println("OperatingIncome: " + operatingIncome);
    System.out.println("PreTaxIncome: " + preTaxIncome);
    System.out.println("NetIncome: " + netIncome);

    summary.setGrossProfit(grossProfit);
    summary.setOperatingIncome(operatingIncome);
    summary.setPreTaxIncome(preTaxIncome);
    summary.setNetIncome(netIncome);

    // 將明細列表放入 summary
    summary.setDetails(amounts);

    return summary;
}

    /**
     * 根據 parentId 決定正負號
     * 收入類轉正數、費用類轉負數
     */
    private BigDecimal adjustSign(Long parentId, BigDecimal amount) {
        if (parentId == null || amount == null) {
            return BigDecimal.ZERO;
        }

        // 收入類 (正數)
        if (parentId == 4000L || parentId == 7050L || parentId == 7100L || parentId == 7230L) {
            return amount.abs();
        }

        // 費用類 (負數)
        if (parentId == 5000L || parentId == 6100L || parentId == 6200L || parentId == 6300L || parentId == 7950L) {
            return amount.abs().negate();
        }

        // 其他保持原樣
        return amount;
    }

    // 計算營業毛利
    private BigDecimal calculateGrossProfit(List<ParentCategoryAmount> amounts) {
        BigDecimal revenue = amounts.stream()
            .filter(a -> a.getParentId() == 4000L)
            .map(ParentCategoryAmount::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal cost = amounts.stream()
            .filter(a -> a.getParentId() == 5000L)
            .map(ParentCategoryAmount::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return revenue.add(cost); // cost 已經是負數
    }

    private BigDecimal calculateOperatingIncome(List<ParentCategoryAmount> amounts) {
        BigDecimal gross = calculateGrossProfit(amounts);

        BigDecimal expenses = amounts.stream()
            .filter(a -> List.of(6100L, 6200L, 6300L).contains(a.getParentId()))
            .map(ParentCategoryAmount::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return gross.add(expenses); // expenses 已經是負數
    }

    private BigDecimal calculatePreTaxIncome(List<ParentCategoryAmount> amounts) {
        BigDecimal operating = calculateOperatingIncome(amounts);

        BigDecimal nonOperating = amounts.stream()
            .filter(a -> List.of(7050L, 7100L, 7230L).contains(a.getParentId()))
            .map(ParentCategoryAmount::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return operating.add(nonOperating); // 非營業收入已經是正數
    }

    private BigDecimal calculateNetIncome(List<ParentCategoryAmount> amounts) {
        BigDecimal preTax = calculatePreTaxIncome(amounts);

        BigDecimal tax = amounts.stream()
            .filter(a -> a.getParentId() == 7950L)
            .map(ParentCategoryAmount::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return preTax.add(tax); // tax 已經是負數
    }
}
