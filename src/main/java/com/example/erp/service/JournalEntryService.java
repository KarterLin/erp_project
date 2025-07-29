package com.example.erp.service;

import com.example.erp.dto.JournalDetailDTO;
import com.example.erp.dto.JournalEntryRequest;
import com.example.erp.entity.Account;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.JournalEntry;
import com.example.erp.repository.AccountRepository;
import com.example.erp.repository.ClosePeriodRepository;
import com.example.erp.repository.JournalEntryRepository;
import com.example.erp.util.OpenDateValidator;
import com.example.erp.util.VouchernumberGenerator;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class JournalEntryService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;
    
    @Autowired
    private ClosePeriodRepository cpr;
    
    @Autowired
    private AccountRepository  accountRepository;

    /**
     * 儲存整筆會計分錄（主表 + 明細）
     */
    @Transactional
    public void createEntryWithDetails(JournalEntryRequest request) {
    	BigDecimal totalDebit = BigDecimal.ZERO;
    	BigDecimal totalCredit = BigDecimal.ZERO;
    	LocalDate closeDate = cpr.findLatestClosingTime();
        // 建立主表
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(request.getEntryDate());
        entry.setCreatedAt(LocalDateTime.now());
        
        OpenDateValidator.validate(request.getEntryDate());
        
        if(closeDate != null && request.getEntryDate().isBefore(closeDate.plusDays(1))) {
        	 throw new IllegalArgumentException("日期不可早於上次結帳日：" + closeDate);
        }
        
        
        // 自動產生傳票號碼
        LocalDate date = entry.getEntryDate();
        long count = journalEntryRepository.countByEntryDate(date);

        String voucherNumber = VouchernumberGenerator.generate(date,count+1);
        entry.setVoucherNumber(voucherNumber);

        // 處理明細
        List<JournalDetail> details = new ArrayList<>();
        
        for (JournalDetailDTO dto : request.getDetails()) {        	
        	
            JournalDetail detail = new JournalDetail();
            
            validateDetail(dto);

            // 找出 Account（若找不到會拋錯）
            Account account = accountRepository.findByCode(dto.getAccountCode())
                    .orElseThrow(() -> new IllegalArgumentException("找不到科目編號: " + dto.getAccountCode()));

            detail.setAccount(account);
            detail.setDebit(dto.getDebit());
            detail.setCredit(dto.getCredit());
            
            totalDebit = totalDebit.add(dto.getDebit() != null ? dto.getDebit() : BigDecimal.ZERO);
            totalCredit = totalCredit.add(dto.getCredit() != null ? dto.getCredit() : BigDecimal.ZERO);


            detail.setDescription(dto.getDescription());
            detail.setJournalEntry(entry); // 設定反向關聯

            details.add(detail);
        }
        
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "借方總額與貸方總額不平衡，請檢查分錄！");
        }
        
        entry.setDetails(details);
        journalEntryRepository.save(entry); 
    }  
    
    
    
    private void validateDetail(JournalDetailDTO dto) {
        if (dto.getDebit() != null && dto.getDebit().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "借方金額不可為負數");
        }

        if (dto.getCredit() != null && dto.getCredit().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "貸方金額不可為負數");
        }

        if ((dto.getDebit() == null || dto.getDebit().compareTo(BigDecimal.ZERO) == 0) &&
            (dto.getCredit() == null || dto.getCredit().compareTo(BigDecimal.ZERO) == 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "借貸金額不得皆為 0");
        }

        if (dto.getDebit() != null && dto.getCredit() != null &&
            dto.getDebit().compareTo(BigDecimal.ZERO) > 0 &&
            dto.getCredit().compareTo(BigDecimal.ZERO) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "不能同時填寫借方與貸方");
        }
    }

}
