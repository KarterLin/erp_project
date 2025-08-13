package com.example.erp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.erp.dto.AccountDTO;
import com.example.erp.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    Optional<Account> findByCode(String code);
    
    // 查詢所有啟用的科目並轉為DTO
    @Query("SELECT new com.example.erp.dto.AccountDTO(a.id, a.code, a.name, " +
           "CAST(a.type AS string), a.parentId, a.isActive, p.name) " +
           "FROM Account a LEFT JOIN Account p ON a.parentId = p.id " +
           "WHERE a.isActive = true " +
           "ORDER BY a.code")
    List<AccountDTO> findAllActiveToDTO();
    
    // 查詢所有科目並轉為DTO（包含非啟用的）
    @Query("SELECT new com.example.erp.dto.AccountDTO(a.id, a.code, a.name, " +
           "CAST(a.type AS string), a.parentId, a.isActive, p.name) " +
           "FROM Account a LEFT JOIN Account p ON a.parentId = p.id " +
           "ORDER BY a.code")
    List<AccountDTO> findAllToDTO();
    
    // 根據科目類型查詢
    List<Account> findByTypeAndIsActive(Account.AccountType type, Boolean isActive);
    
    // 根據父科目查詢子科目
    List<Account> findByParentIdAndIsActive(Long parentId, Boolean isActive);
    
    // 檢查科目代碼是否已存在
    boolean existsByCode(String code);
}