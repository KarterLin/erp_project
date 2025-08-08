package com.example.erp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.erp.dto.JournalDetailDTO;
import com.example.erp.dto.JournalEntryRequest;
import com.example.erp.entity.AmortizationSchedule;
import com.example.erp.entity.ScheduleStatus;
import com.example.erp.repository.AmortizationScheduleRepository;
import com.example.erp.repository.JournalDetailRepository;

import jakarta.transaction.Transactional;

@Service
public class AmortizationService {

    @Autowired
    private AmortizationScheduleRepository scheduleRepository;

    @Autowired
    private JournalEntryService journalEntryService;
    
    @Autowired
    private JournalDetailRepository journalDetailRepository;

    @Transactional
    public void generateMonthlyEntries(LocalDate runDate) {
        List<AmortizationSchedule> schedules = scheduleRepository
                .findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        ScheduleStatus.ACTIVE, runDate, runDate);

        for (AmortizationSchedule schedule : schedules) {
            // 已生成過本月分錄 → 跳過
            if (schedule.getLastGeneratedDate() != null &&
                schedule.getLastGeneratedDate().getMonth() == runDate.getMonth() &&
                schedule.getLastGeneratedDate().getYear() == runDate.getYear()) {
                continue;
            }
            
         // 1) 決定本期金額：一般期=monthlyAmount(已經用 RoundingMode.DOWN 算好)
            BigDecimal amountThisMonth = schedule.getMonthlyAmount();
            long count = journalDetailRepository.countSystemGeneratedDetailsByScheduleId(schedule.getId());


            // 2) 如果是最後一期 → 用「剩餘金額」補差額
            if (runDate.plusMonths(1).isAfter(schedule.getEndDate())||
            	    count + 2 >= schedule.getMonths()*2) {

                // 建議：用已入帳金額的合計來算剩餘，最準
                BigDecimal alreadyGenerated = journalDetailRepository
                    .sumSystemGeneratedAmountByScheduleId(schedule.getId()); // 可做成 Optional -> ZERO
                

                BigDecimal remaining = schedule.getTotalAmount().subtract(alreadyGenerated);

                // 保險：避免負數或小於0的邊界
                amountThisMonth = remaining.max(BigDecimal.ZERO);
                schedule.setStatus(ScheduleStatus.FINISHED);
                System.out.println("排程結束");
            }

            // 建立分錄請求
            JournalEntryRequest request = new JournalEntryRequest();
            request.setEntryDate(runDate);

            // 借方（折舊費用科目）
            JournalDetailDTO debitDetail = new JournalDetailDTO();
            debitDetail.setAccountCode(schedule.getDepreciationAccount().getCode());
            debitDetail.setDebit(amountThisMonth);
            debitDetail.setCredit(BigDecimal.ZERO);
            debitDetail.setDescription("[系統攤提] " + schedule.getAssetName());

            // 貸方（資產科目）
            JournalDetailDTO creditDetail = new JournalDetailDTO();
            creditDetail.setAccountCode(schedule.getJournalDetail().getAccount().getCode());
            creditDetail.setDebit(BigDecimal.ZERO);
            creditDetail.setCredit(amountThisMonth);
            creditDetail.setDescription("[系統攤提] " + schedule.getAssetName());

            request.setDetails(Arrays.asList(debitDetail, creditDetail));

            // 建立分錄
            journalEntryService.createEntryWithDetails(request,true,schedule.getId());

            // 更新最後攤提日期
            schedule.setLastGeneratedDate(runDate);
            scheduleRepository.save(schedule);
        }
    }
}

