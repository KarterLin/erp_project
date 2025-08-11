package com.example.erp.controller;

import com.example.erp.service.FixedAssetService;
import com.example.erp.service.IntangibleAssetService;
import com.example.erp.dto.AssetAmortizationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/amortization")
public class AssetAmortizationController {

    private final FixedAssetService fixedAssetService;
    private final IntangibleAssetService intangibleAssetService;

    public AssetAmortizationController(FixedAssetService fixedAssetService,
                                       IntangibleAssetService intangibleAssetService) {
        this.fixedAssetService = fixedAssetService;
        this.intangibleAssetService = intangibleAssetService;
    }

    /**
     * 固定資產攤提登錄
     */
    @PostMapping("/fixed")
    public ResponseEntity<String> createFixedAsset(@RequestBody AssetAmortizationRequest request) {
        fixedAssetService.createFixedAsset(request);
        return ResponseEntity.ok("固定資產已成功登錄並建立攤提排程！");
    }

    /**
     * 無形資產攤提登錄
     */
    @PostMapping("/intangible")
    public ResponseEntity<String> createIntangibleAsset(@RequestBody AssetAmortizationRequest request) {
        intangibleAssetService.createIntangibleAsset(request);
        return ResponseEntity.ok("無形資產已成功登錄並建立攤提排程！");
    }
} 

