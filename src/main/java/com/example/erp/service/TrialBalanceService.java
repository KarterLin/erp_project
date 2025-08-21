package com.example.erp.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.erp.dto.TrialBalanceDTO;
import com.example.erp.dto.TrialBalanceSummaryDTO;
import com.example.erp.repository.ClosePeriodRepository;
import com.example.erp.repository.TrialBalanceRepository;
import com.example.erp.util.OpenDateValidator;

@Service
public class TrialBalanceService {
    private TrialBalanceRepository tbr;
    private ClosePeriodRepository closingTime;
    
    public TrialBalanceService(TrialBalanceRepository tbr, ClosePeriodRepository closingTime) {
        this.tbr = tbr;
        this.closingTime = closingTime; 
    }
    
    public TrialBalanceSummaryDTO getTBSum(LocalDate end) {
        // 取得最後關帳日期
        LocalDate lastClosed = closingTime.findLatestClosingTime();
        
        // 計算起始日期的邏輯
        LocalDate start;
        
        if (lastClosed == null) {
            // 尚無關帳紀錄，從系統開始運作日期計算（假設從2025年1月1日開始）
            start = LocalDate.of(2025, 1, 1);
        } else {
            // 有關帳紀錄的情況
            if (end.isAfter(lastClosed)) {
                // 查詢日期在關帳日期之後，從關帳日期的下一天開始
                start = lastClosed.plusDays(1);
            } else {
                // 查詢日期在關帳日期之前或等於關帳日期
                // 這種情況下應該從該年度的1月1日開始
                start = end.withDayOfYear(1);
            }
        }
        
        // 確保起始日期不會晚於結束日期
        if (start.isAfter(end)) {
            start = end;
        }
        
        OpenDateValidator.validateRange(start, end);
        LocalDate endExclusive = end.plusDays(1);
        
        // 查詢試算表詳細資料（只查詢 is_active = 1 的資料）
        List<TrialBalanceDTO> details = tbr.findTB(start, endExclusive);
        TrialBalanceSummaryDTO summary = tbr.findSummary(start, endExclusive);
        
        return new TrialBalanceSummaryDTO(
                summary.getTotalDebit(),
                summary.getTotalCredit(),
                details);
    }
}