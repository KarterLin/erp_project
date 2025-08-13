package com.example.erp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.erp.dto.AccountDTO;
import com.example.erp.entity.Account;

import io.lettuce.core.dynamic.annotation.Param;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByCode(String code);

    @Query("SELECT a.code FROM Account a WHERE a.name = :name")
    Optional<String> findCodeByName(@Param("name") String name);
    
    // 查詢所有啟用的科目並轉為DTO（完整欄位）
    @Query("SELECT new com.example.erp.dto.AccountDTO(a.id, a.code, a.name, " +
           "CAST(a.type AS string), a.parentId, a.isActive, p.name) " +
           "FROM Account a LEFT JOIN Account p ON a.parentId = p.id " +
           "WHERE a.isActive = true " +
           "ORDER BY a.code")
    List<AccountDTO> findAllActiveToDTO();
    
    // 查詢所有科目並轉為DTO（完整欄位，包含非啟用）
    @Query("SELECT new com.example.erp.dto.AccountDTO(a.id, a.code, a.name, " +
           "CAST(a.type AS string), a.parentId, a.isActive, p.name) " +
           "FROM Account a LEFT JOIN Account p ON a.parentId = p.id " +
           "ORDER BY a.code")
    List<AccountDTO> findAllFullToDTO();

    // 查詢所有科目（簡化版 DTO，只包含 code 和 name）
    @Query("SELECT new com.example.erp.dto.AccountDTO(a.code, a.name) FROM Account a WHERE a.id <> 65")
    List<AccountDTO> findAllSimpleToDTO();

    // 根據代碼清單查詢科目（簡化版 DTO）
    @Query("SELECT new com.example.erp.dto.AccountDTO(a.code, a.name) FROM Account a WHERE a.code IN :codes")
    List<AccountDTO> findAccountsByCodes(@Param("codes") List<String> codes);
    
    // 根據科目類型查詢
    List<Account> findByTypeAndIsActive(Account.AccountType type, Boolean isActive);
    
    // 根據父科目查詢子科目
    List<Account> findByParentIdAndIsActive(Long parentId, Boolean isActive);
    
    // 檢查科目代碼是否已存在
    boolean existsByCode(String code);
}
