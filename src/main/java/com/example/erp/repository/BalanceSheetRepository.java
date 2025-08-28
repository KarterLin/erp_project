package com.example.erp.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.erp.dto.ParentCategoryAmount;
import com.example.erp.entity.Account;
import com.example.erp.entity.JournalDetail;

@Repository
public interface BalanceSheetRepository extends JpaRepository<JournalDetail, Long> {

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

    // 計算父科目餘額（native SQL）
    @Query("""
       SELECT new com.example.erp.dto.ParentCategoryAmount(
              a.parentId,
              SUM(jd.debit) - SUM(jd.credit)
       )
       FROM JournalDetail jd
       JOIN jd.account a
       JOIN jd.journalEntry e
       WHERE a.isActive = true
       AND jd.isActive = true
       AND e.status = com.example.erp.entity.EntryStatus.APPROVED
       AND e.entryDate BETWEEN :startDate AND :endDate
       GROUP BY a.parentId
       """)
       List<ParentCategoryAmount> findParentBalancesByDateRange(
       @Param("startDate") LocalDate startDate,
       @Param("endDate") LocalDate endDate
       );
       }
