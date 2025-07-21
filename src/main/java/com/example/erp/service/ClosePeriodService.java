package com.example.erp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.entity.Account;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.JournalEntry;
import com.example.erp.repository.ClosePeriodRepository;
import com.example.erp.repository.JournalDetailRepository;
import com.example.erp.repository.JournalEntryRepository;
import com.example.erp.util.OpenDateValidator;
import com.example.erp.util.VouchernumberGenerator;


@Service
@Transactional
public class ClosePeriodService {
	
	private ClosePeriodRepository cpr;
	private final JournalDetailRepository jdr;
	private final JournalEntryRepository jer;
	private final JdbcTemplate jt;
	
	public ClosePeriodService(ClosePeriodRepository cpr,
			                  JournalEntryRepository jer,
			                  JournalDetailRepository jdr,
			                  JdbcTemplate jt) {
		this.cpr = cpr;
		this.jer = jer;
		this.jdr = jdr;
		this.jt = jt;
	}
	
	
	public void closePeriod(LocalDate start, LocalDate end) {
		
		OpenDateValidator.validateRange(start, end);
		
		
		if(Objects.isNull(start)) {
			start = determineStartDate(end);
		}
		
		LocalDate lastClosed = cpr.findLatestClosingTime();
		if(lastClosed !=null && start.isBefore(lastClosed.plusDays(1))) {
			throw new IllegalStateException("該期已結帳");
		}
		
		
		//檢查是否以結帳
//		long count = jdr.countSystemGeneratedInPeriod(start, end);
//		if(count > 0) {
//			throw new IllegalStateException("該期已結帳");
//		}
		
		List<JournalEntry> locked = jer.lockEntries(start, end);
		
		BigDecimal retainedEarning = jdr.calcRetainedEarning(start, end);
		
		JournalEntry entry = new JournalEntry();
		LocalDate today = LocalDate.now();
        long vCount = jer.countByEntryDate(today);

        String voucherNumber = VouchernumberGenerator.generate(today,vCount+1);
        entry.setVoucherNumber(voucherNumber);
        entry.setEntryDate(today);
        jer.save(entry);
        
        JournalDetail retained = new JournalDetail();
        Account account = new Account();
        account.setId(65L);
        retained.setJournalEntry(entry);
        retained.setAccount(account);

        retained.setDescription("結帳:"+ start +"~" + end);
        if(retainedEarning.compareTo(BigDecimal.ZERO)>0) {
        	retained.setDebit(BigDecimal.ZERO);
        	retained.setCredit(retainedEarning);
        }else {
        	retained.setCredit(BigDecimal.ZERO);
        	retained.setDebit(retainedEarning.abs());
        }
        
        retained.setIsActive(true);
        retained.setIsSystemGenerated(false);
        jdr.save(retained);
        
        jt.update("CALL proc_reverse_virtual_entries(?, ?, ?)", start, end, entry.getId());
        
	}
	
	 private LocalDate determineStartDate(LocalDate endDate) {
	        LocalDate lastClosedDate = cpr.findLatestClosingTime();

	        if (lastClosedDate == null || endDate.isBefore(lastClosedDate)) {
	            // 如果沒找到上次結帳日 → 該年 1/1
	            return LocalDate.of(endDate.getYear(), 1, 1);
	        } else {
	            // 有找到 → 上次結帳日 + 1 天
	            return lastClosedDate.plusDays(1);
	        }
	    }
	
	
}
