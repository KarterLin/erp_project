package com.example.erp.service;

import com.example.erp.entity.Category;
import com.example.erp.entity.ScheduleStatus;
import com.example.erp.repository.AccountRepository;
import com.example.erp.repository.AmortizationScheduleRepository;
import com.example.erp.util.AssetAccountMapper;
import com.example.erp.dto.AssetAmortizationRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 固定資產與無形資產共用 Service，區別在 Controller 注入時指定 Category
 */
@Service
public class FixedAssetService extends AbstractAmortizationService<AssetAmortizationRequest> {

    private final VoucherNumberService voucherNumberService;

    private final Category category;

    public FixedAssetService(JournalEntryService journalEntryService,
                              AccountRepository accountRepo,
                              AmortizationScheduleRepository scheduleRepo,
                              VoucherNumberService voucherNumberService) {
        super(journalEntryService, accountRepo, scheduleRepo);
        this.category = Category.FIXED_ASSET; // 也可以建立一個 IntangibleAssetService 改這行即可
        this.voucherNumberService = voucherNumberService;
    }

    public void createFixedAsset(AssetAmortizationRequest r) {
        super.createAndSchedule(r);
    }

    // ===== Getter =====
    @Override protected LocalDate getEntryDate(AssetAmortizationRequest r) { return r.getEntryDate(); }
    @Override protected BigDecimal getAmount(AssetAmortizationRequest r) { return r.getAmount(); }
    @Override protected String getDescription(AssetAmortizationRequest r) { return r.getDescription(); }
    @Override protected String getAssetName(AssetAmortizationRequest r) { return r.getAssetName(); }
    @Override protected String getAssetCode() {return voucherNumberService.generateFixedAssetNumber(LocalDate.now());}

    @Override protected int getUsageMonths(AssetAmortizationRequest r) {
    	int years = r.getUsageYears() != null ? r.getUsageYears() : 0;
        int months = r.getMonth() != null ? r.getMonth() : 0;
        
        if (years < 0 || months < 0) {
            throw new IllegalArgumentException("攤提年/月不得為負數");
        }
        
        if (!"1411000".equals(getOriginalDebitAccountCode(r)) && years <=0 && months <= 0) {
    		throw new IllegalArgumentException("請輸入攤提時間");
        }
        
        if ("1411000".equals(getOriginalDebitAccountCode(r)) && (years > 0 || months > 0)) {
        	throw new IllegalArgumentException("土地資產無須攤提");
        }
        
        return years * 12 + months;
    }

    @Override protected BigDecimal getResidualValue(AssetAmortizationRequest r) {
        return r.getSalvageValue() != null ? r.getSalvageValue() : BigDecimal.ZERO;
    }

    @Override protected String getOriginalDebitAccountCode(AssetAmortizationRequest r) {
        return AssetAccountMapper.getFAByAssetName(r.getAssetName()).assetCode(); // 借方 = 資產帳戶
    }

    @Override protected String getOriginalCreditAccountCode(AssetAmortizationRequest r) {
        return r.getCreditAccountCode();
    }

    @Override protected String getScheduleDebitAccountCode(AssetAmortizationRequest r) {
        return AssetAccountMapper.getFAByAssetName(r.getAssetName()).expenseCode(); // 每期 借：折舊/攤銷費用
    }

    @Override protected String getScheduleCreditAccountCode(AssetAmortizationRequest r) {
        return AssetAccountMapper.getFAByAssetName(r.getAssetName()).accumulatedCode(); // 每期 貸：累積折舊/攤銷
    }

    @Override protected Category getCategory(AssetAmortizationRequest r) {
        return this.category; // 可設定為 FIXED_ASSET 或 INTANGIBLE_ASSET
    }
    
    @Override protected ScheduleStatus getScheduleStatus(AssetAmortizationRequest r) {
    	if ("1411000".equals(getOriginalDebitAccountCode(r))) {
    		return ScheduleStatus.CANCELLED;
        }else {
    	    return ScheduleStatus.ACTIVE;
        }        
    }
}
