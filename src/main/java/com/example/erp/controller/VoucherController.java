package com.example.erp.controller;

import com.example.erp.dto.VoucherDTO;
import com.example.erp.dto.VoucherSearchRequest;
import com.example.erp.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for voucher related operations.
 */
@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    /**
     * Fetch voucher details by voucher number.
     */
    /**
     * Retrieve all voucher entries.
     */
    @GetMapping
    public List<VoucherDTO> getAllVouchers() {
        return voucherService.getAllVoucherDetails();
    }

    /**
     * Fetch voucher details by voucher number.
     */
    @GetMapping("/{voucherNumber}")
    public List<VoucherDTO> getVoucher(@PathVariable String voucherNumber) {
        return voucherService.getVoucherDetails(voucherNumber);
    }
    
    @PostMapping("/search")
    public ResponseEntity<List<VoucherDTO>> search(@RequestBody VoucherSearchRequest request) {
        return ResponseEntity.ok(voucherService.searchVouchers(request));
    }

}
