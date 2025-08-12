package com.example.erp.service;

import com.example.erp.dto.JournalDetailDTO;
import com.example.erp.dto.JournalEntryRequest;
import com.example.erp.entity.Account;
import com.example.erp.entity.AmortizationSchedule;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.Category;
import com.example.erp.entity.ScheduleStatus;
import com.example.erp.repository.AccountRepository;
import com.example.erp.repository.AmortizationScheduleRepository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

public abstract class AbstractAmortizationService<R> {

    protected final JournalEntryService journalEntryService;
    protected final AccountRepository accountRepo;
    protected final AmortizationScheduleRepository scheduleRepo;

    protected AbstractAmortizationService(JournalEntryService journalEntryService,
                                          AccountRepository accountRepo,
                                          AmortizationScheduleRepository scheduleRepo) {
        this.journalEntryService = journalEntryService;
        this.accountRepo = accountRepo;
        this.scheduleRepo = scheduleRepo;
    }

    @Transactional
    public void createAndSchedule(R r) {
        // 1) 原始分錄
        JournalEntryRequest entryReq = new JournalEntryRequest();
        entryReq.setEntryDate(getEntryDate(r));

        JournalDetailDTO debit = new JournalDetailDTO();
        debit.setAccountCode(getOriginalDebitAccountCode(r));   // 借：預付/資產
        debit.setDebit(getAmount(r));
        debit.setCredit(BigDecimal.ZERO);
        debit.setDescription(getDescription(r));

        JournalDetailDTO credit = new JournalDetailDTO();
        credit.setAccountCode(getOriginalCreditAccountCode(r)); // 貸：現金/應付
        credit.setDebit(BigDecimal.ZERO);
        credit.setCredit(getAmount(r));
        credit.setDescription(getDescription(r));

        entryReq.setDetails(List.of(debit, credit));

        // false=手動(表單)建立；scheduleId=null（原始分錄不綁排程）
        var entry = journalEntryService.createEntryWithDetails(entryReq, false, null);

        // 抓原始的「借方」明細當來源 detail
        JournalDetail sourceDetail = entry.getDetails().stream()
            .filter(d -> d.getDebit()!=null && d.getDebit().compareTo(BigDecimal.ZERO)>0)
            .findFirst().orElseThrow();

        // 2) 建排程
        int months = getUsageMonths(r);
        BigDecimal base = getAmount(r).subtract(getResidualValue(r));     // 可攤金額
        if (base.signum() < 0) throw new IllegalArgumentException("殘值不可大於金額");

        BigDecimal monthly;
        if(getOriginalDebitAccountCode(r).equals("1411000")) {
        	monthly = BigDecimal.ZERO;
        }else {
        	monthly = base.divide(BigDecimal.valueOf(months), 0, RoundingMode.DOWN); // 無條件捨去
        }

        Account debitAccount  = accountRepo.findByCode(getScheduleDebitAccountCode(r)).orElseThrow();
        Account creditAccount = accountRepo.findByCode(getScheduleCreditAccountCode(r)).orElseThrow();

        AmortizationSchedule s = new AmortizationSchedule();
        s.setJournalDetail(sourceDetail);                // 來源明細
        s.setCategory(getCategory(r));
        s.setAssetName(getAssetName(r));
        s.setAssetCode(getAssetCode());
        s.setStartDate(getEntryDate(r));
        s.setEndDate(getEntryDate(r).plusMonths(months - 1));
        s.setTotalAmount(base);                          // 注意：存可攤金額（已扣殘值）
        s.setMonthlyAmount(monthly);
        s.setMonths(months);
        s.setResidualValue(getResidualValue(r));
        s.setDepreciationAccount(debitAccount);          // 每期 借
        s.setAssetAccount(creditAccount);                // 每期 貸（預付或累積）
        s.setStatus(getScheduleStatus(r));

        scheduleRepo.save(s);
    }

    // ====== 子類提供的 getter（差異點）======
    protected abstract LocalDate getEntryDate(R r);
    protected abstract BigDecimal getAmount(R r);
    protected abstract String getDescription(R r);
    protected abstract String getAssetName(R r);
    protected abstract String getAssetCode(); 
    protected abstract int getUsageMonths(R r);
    protected abstract BigDecimal getResidualValue(R r);           // 預付費用回傳 BigDecimal.ZERO
    protected abstract String getOriginalDebitAccountCode(R r);    // 原始分錄 借
    protected abstract String getOriginalCreditAccountCode(R r);   // 原始分錄 貸
    protected abstract String getScheduleDebitAccountCode(R r);    // 每期 借
    protected abstract String getScheduleCreditAccountCode(R r);   // 每期 貸
    protected abstract Category getCategory(R r);
    protected abstract ScheduleStatus getScheduleStatus(R r);
}

