package com.example.erp.service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.erp.dto.TrialBalanceDTO;
import com.example.erp.repository.ClosePeriodRepository;
import com.example.erp.repository.TrialBalanceRepository;
import com.example.erp.util.OpenDateValidator;

@Service
public class TrialBalanceService {
	private TrialBalanceRepository tbr;
	private ClosePeriodRepository closingTime;
	
	@Autowired
	public TrialBalanceService(TrialBalanceRepository tbr, ClosePeriodRepository closingTime) {
		this.tbr = tbr;
		this.closingTime = closingTime; 
	}
	
	public List<TrialBalanceDTO> getTBDetails (LocalDate end){
		LocalDate lastClosed = closingTime.findLatestClosingTime();
		LocalDate start = null;
		if(end.isBefore(lastClosed)) {
			start = end.withDayOfYear(1);
		}else {
			start = lastClosed.plusDays(1);
		}
		
		OpenDateValidator.validateRange(start, end);
		
		return tbr.findTB(start, end);
	}

}
