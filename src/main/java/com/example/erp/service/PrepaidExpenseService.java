package com.example.erp.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.example.erp.dto.PrepaidExpenseRequest;
import com.example.erp.entity.Category;
import com.example.erp.entity.ScheduleStatus;
import com.example.erp.repository.AccountRepository;
import com.example.erp.repository.AmortizationScheduleRepository;
import com.example.erp.util.AssetAccountMapper;

@Service
public class PrepaidExpenseService extends AbstractAmortizationService<PrepaidExpenseRequest> {

    public PrepaidExpenseService(JournalEntryService journalEntryService,
                                 AccountRepository accountRepo,
                                 AmortizationScheduleRepository scheduleRepo) {
        super(journalEntryService, accountRepo, scheduleRepo);
    }

    // 對外 API：沿用你的方法名
    public void createPrepaidAndSchedule(PrepaidExpenseRequest r) {
        super.createAndSchedule(r);
    }

    // ===== 實作差異點 Getter =====
    @Override protected LocalDate getEntryDate(PrepaidExpenseRequest r) { return r.getEntryDate(); }
    @Override protected BigDecimal getAmount(PrepaidExpenseRequest r) { return r.getAmount(); }
    @Override protected String getDescription(PrepaidExpenseRequest r) { return r.getDescription(); }
    @Override protected String getAssetName(PrepaidExpenseRequest r) { return r.getExpenseName(); }
    @Override protected String getAssetCode() {return "None";}

    @Override protected int getUsageMonths(PrepaidExpenseRequest r) { return r.getUsageMonth(); }
    @Override protected BigDecimal getResidualValue(PrepaidExpenseRequest r) { return BigDecimal.ZERO; }

    // 原始分錄：借 預付費用、貸 現金/應付
    @Override protected String getOriginalDebitAccountCode(PrepaidExpenseRequest r) { 
        // 使用 expenseType (預付費用類型) 來查找對應的資產科目代碼
        return AssetAccountMapper.getByAssetName(r.getExpenseType()).assetCode();
    }
    @Override protected String getOriginalCreditAccountCode(PrepaidExpenseRequest r) { return r.getCreditAccountCode(); }

    // 每期攤提：借 費用、貸 預付費用
    @Override protected String getScheduleDebitAccountCode(PrepaidExpenseRequest r) { return r.getAmortizeExpenseCode(); }
    @Override protected String getScheduleCreditAccountCode(PrepaidExpenseRequest r) { 
        // 攤提時貸方也是對應的預付費用科目
        return AssetAccountMapper.getByAssetName(r.getExpenseType()).assetCode();
    }

    @Override protected Category getCategory(PrepaidExpenseRequest r) { return Category.PREPAID_EXPENSE; }
    @Override protected ScheduleStatus getScheduleStatus(PrepaidExpenseRequest r) {return ScheduleStatus.ACTIVE; }
}