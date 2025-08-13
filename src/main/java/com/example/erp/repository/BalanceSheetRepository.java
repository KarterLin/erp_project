package com.example.erp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.erp.entity.Account;

public interface BalanceSheetRepository extends JpaRepository<Account, Long> {

    // 使用字串比較，避免枚舉類型衝突問題
    @Query("SELECT DISTINCT a FROM Account a " +
           "JOIN JournalDetail jd ON jd.account = a " +
           "WHERE CAST(a.type AS string) = 'asset'")
    List<Account> findUsedAssetAccounts();

    @Query("SELECT DISTINCT a FROM Account a " +
           "JOIN JournalDetail jd ON jd.account = a " +
           "WHERE CAST(a.type AS string) = 'liability'")
    List<Account> findUsedLiabilityAccounts();

    @Query("SELECT DISTINCT a FROM Account a " +
           "JOIN JournalDetail jd ON jd.account = a " +
           "WHERE CAST(a.type AS string) = 'equity'")
    List<Account> findUsedEquityAccounts();

    @Query("SELECT DISTINCT a FROM Account a " +
           "JOIN JournalDetail jd ON jd.account = a " +
           "WHERE CAST(a.type AS string) IN ('revenue', 'expense')")
    List<Account> findUsedRevenueAndExpenseAccounts();
}