package com.example.erp.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    @Query(value = """
        SELECT a.parent_id AS parentId,
               SUM(j.debit) - SUM(j.credit) AS balance
        FROM journal_detail j
        JOIN account a ON j.account_id = a.id
        JOIN journal_entry e ON j.journal_entry_id = e.id
        WHERE a.is_active = 1
          AND j.is_active = 1
          AND e.status = 'APPROVED'
          AND e.entry_date BETWEEN :startDate AND :endDate
        GROUP BY a.parent_id
        """, nativeQuery = true)
    List<Object[]> findParentBalancesByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
