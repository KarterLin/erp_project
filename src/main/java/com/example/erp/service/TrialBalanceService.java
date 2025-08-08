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
        // 取得最後關帳日期，假設 ClosePeriodRepository 有方法取得
        LocalDate lastClosed = closingTime.findLatestClosingTime();

        if (lastClosed == null) {
            // 尚無關帳紀錄，預設從當年初開始
            lastClosed = end.withDayOfYear(1).minusDays(1); // 比如 1/1 的前一天
        }

		LocalDate start = end.isBefore(lastClosed.plusDays(1))? 
				end.withDayOfYear(1):lastClosed.plusDays(1);
			
		
		OpenDateValidator.validateRange(start, end);
		LocalDate endExclusive = end.plusDays(1);
		
		List<TrialBalanceDTO> details = tbr.findTB(start, endExclusive);
		TrialBalanceSummaryDTO summary = tbr.findSummary(start, endExclusive);
		
		return new TrialBalanceSummaryDTO(
				summary.getTotalDebit(),
				summary.getTotalCredit(),
				details);
	}
	

}
