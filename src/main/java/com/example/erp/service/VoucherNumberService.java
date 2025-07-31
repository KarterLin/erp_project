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

	    public String generateTodayVoucherNumber(LocalDate entryDate) {
	        // 計算 ROC 年月日，如 1140803
	        String rocYear = String.valueOf(entryDate.getYear() - 1911);
	        String monthDay = String.format("%02d%02d", entryDate.getMonthValue(), entryDate.getDayOfMonth());
	        String base = rocYear + monthDay;

	        // Redis key 設為 voucher:seq:1140803
	        String redisKey = "voucher:seq:" + base;
	        RAtomicLong counter = redissonClient.getAtomicLong(redisKey);

	        // 設定自動過期 1 天（保證隔日重新編號）
	        counter.expire(Duration.ofDays(1));

	        // 遞增並取得編號（保證唯一）
	        long sequence = counter.incrementAndGet();
	        String sequenceStr = String.format("%03d", sequence);

	        return base + sequenceStr;
	    }
    }



