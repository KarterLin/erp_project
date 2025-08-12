package com.example.erp.controller;

import com.example.erp.dto.AccountDTO;
import com.example.erp.entity.Account;
import com.example.erp.repository.AccountRepository;
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
    
    @Autowired
    private AccountRepository accountRepository;

    @GetMapping
    public List<AccountDTO> getAccounts() {
        return accountService.getAccounts();
    }
    
    //預付費用貸方科目
    @GetMapping("/peca")
    public List<AccountDTO> getPrepaidExpenseCreditAccounts() {
    	List<String> codes = List.of("1111000","1113001","1113004","1113011","1113012",
    			                     "1113021","1113031","1113032");
    	
        return accountRepository.findAccountsByCodes(codes);
    }
    //每期攤提科目
    @GetMapping("/amortize-expense-code")
    public List<AccountDTO> getAmortizeExpenseCode() {
    	List<String> codes = List.of("6102001","6102003","6111005","6110003","6110004");
    	
    	return accountRepository.findAccountsByCodes(codes);
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountService.save(account);
    }
}
