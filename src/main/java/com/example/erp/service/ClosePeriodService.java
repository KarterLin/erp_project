package com.example.erp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.entity.Account;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.JournalEntry;
import com.example.erp.repository.JournalDetailRepository;
import com.example.erp.repository.JournalEntryRepository;
import com.example.erp.util.VouchernumberGenerator;


@Service
@Transactional
public class ClosePeriodService {
	
	private final JournalDetailRepository jdr;
	private final JournalEntryRepository jer;
	private final JdbcTemplate jt;
	
	public ClosePeriodService(JournalEntryRepository jer,
			                  JournalDetailRepository jdr,
			                  JdbcTemplate jt) {
		this.jer = jer;
		this.jdr = jdr;
		this.jt = jt;
	}
	
	
	public void closePeriod(LocalDate start, LocalDate end) {
		
		List<JournalEntry> locked = jer.lockEntries(start, end);
		
		//檢查是否以結帳
		long count = jdr.countSystemGeneratedInPeriod(start, end);
		if(count > 0) {
			throw new IllegalStateException("該期已結帳");
		}
		
		BigDecimal retainedEarning = jdr.calcRetainedEarning(start, end);
		
		JournalEntry entry = new JournalEntry();
		LocalDate today = LocalDate.now();
        long vCount = jer.countByEntryDate(today);

        String voucherNumber = VouchernumberGenerator.generate(today,vCount+1);
        entry.setVoucherNumber(voucherNumber);
        entry.setEntryDate(today);
        entry.setDescription("結帳:"+ start +"~" + end);
        jer.save(entry);
        
        JournalDetail retained = new JournalDetail();
        Account account = new Account();
        account.setId(65L);
        retained.setJournalEntry(entry);
        retained.setAccount(account);
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
	
	
	
}
