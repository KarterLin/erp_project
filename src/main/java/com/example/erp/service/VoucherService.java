package com.example.erp.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.erp.dto.VoucherDTO;
import com.example.erp.dto.VoucherSearchRequest;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.JournalEntry;
import com.example.erp.repository.JournalEntryRepository;
import com.example.erp.repository.VoucherRepository;
import com.example.erp.util.VoucherSpecification;

/**
 * Service for retrieving voucher details by voucher number.
 */
@Service
public class VoucherService {

	@Autowired
    private VoucherRepository voucherRepository;
    private JournalEntryRepository jer;
    
    public VoucherService(JournalEntryRepository jer){
    	this.jer=jer;
    }

    /**
     * Query voucher details using the voucher number.
     */
    
    public List<VoucherDTO> searchVouchers(VoucherSearchRequest request) {
        System.out.println("搜尋參數: " + request); // 調試用
        
        List<JournalEntry> entries = jer.findAll(VoucherSpecification.build(request));
        
        System.out.println("找到 " + entries.size() + " 筆 JournalEntry"); // 調試用
        
        List<VoucherDTO> result = new ArrayList<>();
        for (JournalEntry entry : entries) {
            System.out.println("處理 JournalEntry ID: " + entry.getId() + ", 日期: " + entry.getEntryDate()); // 調試用
            
            for (JournalDetail d : entry.getDetails()) {
                if (d.getIsActive()) {
                    VoucherDTO dto = new VoucherDTO();
                    dto.setVoucherNumber(entry.getVoucherNumber());
                    dto.setAccountName(d.getAccount().getName());
                    dto.setAccountCode(d.getAccount().getCode());
                    dto.setDebitAmount(d.getDebit());
                    dto.setCreditAmount(d.getCredit());
                    dto.setSummary(d.getDescription());
                    dto.setDescription(d.getDescription());
                    // 確保日期欄位被正確設定
                    dto.setVoucherDate(entry.getEntryDate());
                    
                    System.out.println("建立 DTO: " + dto.getVoucherNumber() + ", 日期: " + dto.getVoucherDate()); // 調試用
                    
                    result.add(dto);
                }
            }
        }
        
        System.out.println("返回 " + result.size() + " 筆 VoucherDTO"); // 調試用
        return result;
    }

    public List<VoucherDTO> getVoucherDetails(String voucherNumber) {
        return voucherRepository.findVoucherDetails(voucherNumber);
    }
    
    public List<VoucherDTO> getAllVoucherDetails() {
        return voucherRepository.findAllVoucherDetails();
    }
}