package com.example.erp.util;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.erp.service.AmortizationService;

@Component
public class AmortizationScheduler {

    @Autowired
    private AmortizationService amortizationService;

    @Scheduled(cron = "0 0 1 * * ?") // 每天凌晨 1 點跑
    public void runAmortization() {
        LocalDate today = LocalDate.now();
        LocalDate lastDayOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        if (today.equals(lastDayOfMonth)) {
            amortizationService.generateMonthlyEntries(today);
        }
    }
}

