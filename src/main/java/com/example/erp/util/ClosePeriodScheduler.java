package com.example.erp.util;

import com.example.erp.service.ClosePeriodService;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;

@Component
@EnableScheduling
public class ClosePeriodScheduler {

    private final ClosePeriodService closePeriodService;
    private static final ZoneId TZ = ZoneId.of("Asia/Taipei");

    public ClosePeriodScheduler(ClosePeriodService closePeriodService) {
        this.closePeriodService = closePeriodService;
    }

    /**
     * 每年 12/31 23:59:59 執行年度結帳
     */
    @Scheduled(cron = "59 59 23 31 12 *", zone = "Asia/Taipei")
    public void autoCloseAtYearEnd() {
        LocalDate today = LocalDate.now(TZ);
        LocalDate lastDayOfYear = Year.now(TZ).atMonth(12).atEndOfMonth();

        if (today.equals(lastDayOfYear)) {
            LocalDate startDate = closePeriodService.determineStartDate(today);
            LocalDate endDate = today;

            closePeriodService.closePeriod(startDate, endDate);
            System.out.println("✅ 自動年度結帳完成: " + startDate + " ~ " + endDate);
        } else {
            System.out.println("⏩ 今天不是年底最後一天，不執行: " + today);
        }
    }
}
 

