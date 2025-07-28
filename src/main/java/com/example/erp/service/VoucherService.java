package com.example.erp.service;

import com.example.erp.dto.VoucherDTO;
import com.example.erp.dto.VoucherSearchRequest;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.JournalEntry;
import com.example.erp.repository.JournalEntryRepository;
import com.example.erp.repository.VoucherRepository;
import com.example.erp.util.VoucherSpecification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
        List<JournalEntry> entries = jer.findAll(VoucherSpecification.build(request));
        
        List<VoucherDTO> result = new ArrayList<>();
        for (JournalEntry entry : entries) {
            for (JournalDetail d : entry.getDetails()) {
                if (d.getIsActive()) {
                    result.add(new VoucherDTO(
                        entry.getVoucherNumber(),
                        d.getAccount().getName(),
                        d.getAccount().getCode(),
                        d.getDebit(),
                        d.getCredit(),
                        d.getDescription()
                    ));
                }
            }
        }
        return result;
    }

    
    
    
    public List<VoucherDTO> getVoucherDetails(String voucherNumber) {
        return voucherRepository.findVoucherDetails(voucherNumber);
    }
    
    public List<VoucherDTO> getAllVoucherDetails() {
        return voucherRepository.findAllVoucherDetails();
    }
}