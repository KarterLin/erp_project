package com.example.erp.service;

import com.example.erp.dto.VoucherDTO;
import com.example.erp.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for retrieving voucher details by voucher number.
 */
@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    /**
     * Query voucher details using the voucher number.
     */
    public List<VoucherDTO> getVoucherDetails(String voucherNumber) {
        return voucherRepository.findVoucherDetails(voucherNumber);
    }
    
    public List<VoucherDTO> getAllVoucherDetails() {
        return voucherRepository.findAllVoucherDetails();
    }
}