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

import jakarta.transaction.Transactional;

@Service
public class AmortizationService {

    @Autowired
    private AmortizationScheduleRepository scheduleRepository;

    @Autowired
    private JournalEntryService journalEntryService;

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

            // 建立分錄請求
            JournalEntryRequest request = new JournalEntryRequest();
            request.setEntryDate(runDate);

            // 借方（折舊費用科目）
            JournalDetailDTO debitDetail = new JournalDetailDTO();
            debitDetail.setAccountCode(schedule.getDepreciationAccount().getCode());
            debitDetail.setDebit(schedule.getMonthlyAmount());
            debitDetail.setCredit(BigDecimal.ZERO);
            debitDetail.setDescription("[系統攤提] " + schedule.getAssetName());

            // 貸方（資產科目）
            JournalDetailDTO creditDetail = new JournalDetailDTO();
            creditDetail.setAccountCode(schedule.getJournalDetail().getAccount().getCode());
            creditDetail.setDebit(BigDecimal.ZERO);
            creditDetail.setCredit(schedule.getMonthlyAmount());
            creditDetail.setDescription("[系統攤提] " + schedule.getAssetName());

            request.setDetails(Arrays.asList(debitDetail, creditDetail));

            // 建立分錄
            journalEntryService.createEntryWithDetails(request,true);

            // 更新最後攤提日期
            schedule.setLastGeneratedDate(runDate);
            scheduleRepository.save(schedule);
        }
    }
}

