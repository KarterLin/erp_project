package com.example.erp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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


@Service
@Transactional
public class ClosePeriodService {

	private static final Logger log = LoggerFactory.getLogger(ClosePeriodService.class);
	
	private ClosePeriodRepository cpr;
	private final JournalDetailRepository jdr;
	private final JournalEntryRepository jer;
	private final JdbcTemplate jt;
	private RedissonClient redissonClient;
	private VoucherNumberService voucherNumberService;

	
	public ClosePeriodService(ClosePeriodRepository cpr,
			                  JournalEntryRepository jer,
			                  JournalDetailRepository jdr,
			                  JdbcTemplate jt,
			                  RedissonClient redissonClient,
			                  VoucherNumberService voucherNumberService) {
		this.cpr = cpr;
		this.jer = jer;
		this.jdr = jdr;
		this.jt = jt;
		this.redissonClient = redissonClient;
		this.voucherNumberService = voucherNumberService;
	}
	
	
	public void closePeriod(LocalDate start, LocalDate end) {
		
		String lockKey = "lock:close-period:global";
        RLock lock = redissonClient.getLock(lockKey);

        boolean locked = false;
        try {
            // 最多等 5 秒取得鎖，鎖定 15 秒（預防長時間操作）
            locked = lock.tryLock(5, 15, TimeUnit.SECONDS);

            if (!locked) {
                throw new IllegalStateException("⚠️ 結帳鎖定中，請稍後再試");
            }

            log.info("🔒 成功取得結帳鎖 for period: {} ~ {}", start, end);                 
		
		OpenDateValidator.validateRange(start, end);
		
		
		if(Objects.isNull(start)) {
			start = determineStartDate(end);
		}
		
		LocalDate lastClosed = cpr.findLatestClosingTime();
		if(lastClosed !=null && start.isBefore(lastClosed.plusDays(1))) {
			throw new IllegalStateException("該期已結帳");
		}
		
//		List<JournalEntry> locked = jer.lockEntries(start, end);
		
		BigDecimal retainedEarning = jdr.calcRetainedEarning(start, end);
		
		JournalEntry entry = new JournalEntry();
		LocalDate today = LocalDate.now();

        String voucherNumber = voucherNumberService.generateTodayVoucherNumber(today);
        
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
        
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("取得結帳鎖時被中斷", e);
        } finally {
            if (locked) {
                lock.unlock();
                log.info("🔓 結帳鎖已釋放");
            }
        }
	}
	
	 public LocalDate determineStartDate(LocalDate endDate) {
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
