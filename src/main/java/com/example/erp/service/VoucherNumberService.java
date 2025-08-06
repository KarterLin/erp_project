package com.example.erp.service;

import java.time.Duration;
import java.time.LocalDate;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

@Service
public class VoucherNumberService {
	 private final RedissonClient redissonClient;

	    public VoucherNumberService(RedissonClient redissonClient) {
	        this.redissonClient = redissonClient;
	    }

	    public String generateSequenceNumber(String keyPrefix,LocalDate entryDate) {
	    	 String rocYear = String.valueOf(entryDate.getYear() - 1911);
	         String monthDay = String.format("%02d%02d", entryDate.getMonthValue(), entryDate.getDayOfMonth());
	         String base = rocYear + monthDay;

	         String redisKey = keyPrefix + ":" + base;
	         RAtomicLong counter = redissonClient.getAtomicLong(redisKey);
	         counter.expire(Duration.ofDays(1));

	         long sequence = counter.incrementAndGet();
	         String sequenceStr = String.format("%03d", sequence);

	         return base + sequenceStr;
	     }

	     // 原本的憑證編號
	     public String generateTodayVoucherNumber(LocalDate date) {
	         return generateSequenceNumber("voucher:seq", date);
	     }

	     // 固定資產編號（FA）
	     public String generateFixedAssetNumber(LocalDate date) {
	         return "FA" + generateSequenceNumber("asset:FA", date);
	     }

	     // 無形資產編號（IA）
	     public String generateIntangibleAssetNumber(LocalDate date) {
	         return "IA" + generateSequenceNumber("asset:IA", date);
	     }
	 }



