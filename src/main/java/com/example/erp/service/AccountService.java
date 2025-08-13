package com.example.erp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.dto.AccountDTO;
import com.example.erp.entity.Account;
import com.example.erp.repository.AccountRepository;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    /**
     * 獲取所有啟用的科目
     */
    public List<AccountDTO> getActiveAccounts() {
        return accountRepository.findAllActiveToDTO();
    }

    /**
     * 獲取所有科目（包含非啟用的）
     */
    public List<AccountDTO> getAllAccounts() {
        return accountRepository.findAllToDTO();
    }

    /**
     * 根據ID獲取科目
     */
    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    /**
     * 根據科目代碼獲取科目
     */
    public Optional<Account> getAccountByCode(String code) {
        return accountRepository.findByCode(code);
    }

    /**
     * 創建新科目
     */
    @Transactional
    public Account createAccount(Account account) {
        // 檢查科目代碼是否已存在
        if (accountRepository.existsByCode(account.getCode())) {
            throw new RuntimeException("科目代碼已存在: " + account.getCode());
        }
        
        // 驗證父科目是否存在（如果有指定父科目）
        // if (account.getParentId() != null) {
        //     Optional<Account> parentAccount = accountRepository.findById(account.getParentId());
        //     if (!parentAccount.isPresent()) {
        //         throw new RuntimeException("指定的父科目不存在");
        //     }
        // }
        
        // 設定預設值
        if (account.getIsActive() == null) {
            account.setIsActive(true);
        }
        
        return accountRepository.save(account);
    }

    /**
     * 更新科目
     */
    @Transactional
    public Account updateAccount(Long id, Account account) {
        Optional<Account> existingAccount = accountRepository.findById(id);
        if (!existingAccount.isPresent()) {
            throw new RuntimeException("科目不存在");
        }
        
        Account accountToUpdate = existingAccount.get();
        
        // 檢查科目代碼是否重複（排除自己）
        Optional<Account> accountWithSameCode = accountRepository.findByCode(account.getCode());
        if (accountWithSameCode.isPresent() && !accountWithSameCode.get().getId().equals(id)) {
            throw new RuntimeException("科目代碼已存在: " + account.getCode());
        }
        
        // 更新欄位
        accountToUpdate.setCode(account.getCode());
        accountToUpdate.setName(account.getName());
        accountToUpdate.setType(account.getType());
        accountToUpdate.setParentId(account.getParentId());
        accountToUpdate.setIsActive(account.getIsActive());
        
        return accountRepository.save(accountToUpdate);
    }

    /**
     * 刪除科目（硬刪除，直接於sql中刪除）
     */
    @Transactional
    public void deleteAccount(Long id) {
        Optional<Account> account = accountRepository.findById(id);
        if (!account.isPresent()) {
            throw new RuntimeException("科目不存在");
        }
        
        // 檢查是否有子科目
        List<Account> children = accountRepository.findByParentIdAndIsActive(id, true);
        if (!children.isEmpty()) {
            throw new RuntimeException("此科目有子科目，無法刪除");
        }
        
        // 軟刪除 - 設為非啟用
        // Account accountToDelete = account.get();
        // accountToDelete.setIsActive(false);
        // accountRepository.save(accountToDelete);

        // 硬刪除 - 直接刪除
        accountRepository.deleteById(id);
    }

    /**
     * 物理刪除科目（慎用）
     */
    @Transactional
    public void hardDeleteAccount(Long id) {
        Optional<Account> account = accountRepository.findById(id);
        if (!account.isPresent()) {
            throw new RuntimeException("科目不存在");
        }
        
        // 檢查是否有子科目
        List<Account> children = accountRepository.findByParentIdAndIsActive(id, true);
        if (!children.isEmpty()) {
            throw new RuntimeException("此科目有子科目，無法刪除");
        }
        
        accountRepository.deleteById(id);
    }

    /**
     * 根據類型獲取科目
     */
    public List<Account> getAccountsByType(Account.AccountType type) {
        return accountRepository.findByTypeAndIsActive(type, true);
    }

    /**
     * 獲取子科目
     */
    public List<Account> getChildAccounts(Long parentId) {
        return accountRepository.findByParentIdAndIsActive(parentId, true);
    }

    /**
     * 儲存科目 (為了相容原有的方法名稱)
     */
    public Account save(Account account) {
        return accountRepository.save(account);
    }
}