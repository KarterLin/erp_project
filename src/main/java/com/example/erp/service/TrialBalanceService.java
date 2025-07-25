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
	
	public TrialBalanceSummaryDTO getTBSum (LocalDate end){
		LocalDate lastClosed = closingTime.findLatestClosingTime();
		LocalDate start = end.isBefore(lastClosed.plusDays(1))? 
				end.withDayOfYear(1):lastClosed.plusDays(1);
			
		
		OpenDateValidator.validateRange(start, end);
		
		List<TrialBalanceDTO> details = tbr.findTB(start, end);
		TrialBalanceSummaryDTO summary = tbr.findSummary(start, end);
		
		return new TrialBalanceSummaryDTO(
				summary.getTotalDebit(),
				summary.getTotalCredit(),
				details);
	}
	

}
