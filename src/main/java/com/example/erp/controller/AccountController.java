package com.example.erp.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.dto.AccountDTO;
import com.example.erp.entity.Account;
import com.example.erp.repository.AccountRepository;
import com.example.erp.service.AccountService;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;
    
    @Autowired
    private AccountRepository accountRepository;

    /**
     * 獲取所有啟用的科目
     */
    @GetMapping
    public ResponseEntity<List<AccountDTO>> getAccounts() {
        try {
            List<AccountDTO> accounts = accountService.getActiveAccounts();
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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

    /**
     * 獲取所有科目（包含非啟用的）
     */
    @GetMapping("/all")
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        try {
            List<AccountDTO> accounts = accountService.getAllAccounts();
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 根據ID獲取科目
     */
    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        try {
            Optional<Account> account = accountService.getAccountById(id);
            if (account.isPresent()) {
                return ResponseEntity.ok(account.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 創建新科目
     */
    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody CreateAccountRequest request) {
        try {
            // 轉換請求到 Account 實體
            Account account = new Account();
            account.setCode(request.getCode());
            account.setName(request.getName());
            account.setType(Account.AccountType.valueOf(request.getType()));
            account.setParentId(request.getParentId());
            account.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            
            Account savedAccount = accountService.createAccount(account);
            return ResponseEntity.ok(savedAccount);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新科目
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(@PathVariable Long id, @RequestBody CreateAccountRequest request) {
        try {
            Account account = new Account();
            account.setCode(request.getCode());
            account.setName(request.getName());
            account.setType(Account.AccountType.valueOf(request.getType()));
            account.setParentId(request.getParentId());
            account.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            
            Account updatedAccount = accountService.updateAccount(id, account);
            return ResponseEntity.ok(updatedAccount);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 刪除科目（軟刪除）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) {
        try {
            accountService.deleteAccount(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 根據類型獲取科目
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getAccountsByType(@PathVariable String type) {
        try {
            Account.AccountType accountType = Account.AccountType.valueOf(type);
            List<Account> accounts = accountService.getAccountsByType(accountType);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("無效的科目類型");
        }
    }

    /**
     * 獲取子科目
     */
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<Account>> getChildAccounts(@PathVariable Long parentId) {
        try {
            List<Account> children = accountService.getChildAccounts(parentId);
            return ResponseEntity.ok(children);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 內部類別：請求物件
    public static class CreateAccountRequest {
        private String code;
        private String name;
        private String type;
        private Long parentId;
        private Boolean isActive;

        // Getters and Setters
        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Long getParentId() {
            return parentId;
        }

        public void setParentId(Long parentId) {
            this.parentId = parentId;
        }

        public Boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }
    }
}