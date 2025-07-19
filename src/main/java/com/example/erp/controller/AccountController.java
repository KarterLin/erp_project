package com.example.erp.controller;

import com.example.erp.dto.AccountDTO;
import com.example.erp.entity.Account;
import com.example.erp.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping
    public List<AccountDTO> getAccounts() {
        return accountService.getAccounts();
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountService.save(account);
    }
}
