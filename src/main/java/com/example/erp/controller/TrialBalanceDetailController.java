package com.example.erp.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.dto.TrialBalanceDTO;
import com.example.erp.service.TrialBalanceService;

@RestController
@RequestMapping("api/trial-balance")
public class TrialBalanceDetailController {
	
	private TrialBalanceService tbs;
	
	@Autowired
	public TrialBalanceDetailController(TrialBalanceService tbs) {
		this.tbs = tbs;
	}
	
	@GetMapping
	public List<TrialBalanceDTO> getTodayTB() {
	    return tbs.getTBDetails(LocalDate.now());
	}
	
	@GetMapping("/{end}")
	public List<TrialBalanceDTO> getTrialBalance(
		    @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

		    return tbs.getTBDetails(end);
		}
}
