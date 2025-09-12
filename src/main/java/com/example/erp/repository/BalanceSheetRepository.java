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
           "JOIN jd.journalEntry je ON je.status = com.example.erp.entity.EntryStatus.APPROVED " +
           "WHERE CAST(a.type AS string) = 'asset'")
    List<Account> findUsedAssetAccounts();

    @Query("SELECT DISTINCT a FROM Account a " +
           "JOIN JournalDetail jd ON jd.account = a " +
           "JOIN jd.journalEntry je ON je.status = com.example.erp.entity.EntryStatus.APPROVED " +
           "WHERE CAST(a.type AS string) = 'liability'")
    List<Account> findUsedLiabilityAccounts();

    @Query("SELECT DISTINCT a FROM Account a " +
           "JOIN JournalDetail jd ON jd.account = a " +
           "JOIN jd.journalEntry je ON je.status = com.example.erp.entity.EntryStatus.APPROVED " +
           "WHERE CAST(a.type AS string) = 'equity'")
    List<Account> findUsedEquityAccounts();

    @Query("SELECT DISTINCT a FROM Account a " +
           "JOIN JournalDetail jd ON jd.account = a " +
           "JOIN jd.journalEntry je ON je.status = com.example.erp.entity.EntryStatus.APPROVED " +
           "WHERE CAST(a.type AS string) IN ('revenue', 'expense')")
    List<Account> findUsedRevenueAndExpenseAccounts();

    // 修正的查詢：確保只取得 APPROVED 狀態的分錄
    @Query(value = """
        SELECT a.parent_id AS parentId,
               SUM(CASE 
                   WHEN a.type IN ('asset', 'expense') THEN j.debit - j.credit
                   WHEN a.type IN ('liability', 'equity', 'revenue') THEN j.credit - j.debit
                   ELSE j.debit - j.credit
               END) AS balance
        FROM journal_detail j
        INNER JOIN account a ON j.account_id = a.id
        INNER JOIN journal_entry e ON j.journal_entry_id = e.id
        WHERE a.is_active = 1
          AND j.is_active = 1
          AND e.status = 'APPROVED'
          AND (
              -- 資產、負債、權益科目：累計到結束日期
              (a.type IN ('asset', 'liability', 'equity') AND e.entry_date <= :endDate)
              OR
              -- 損益科目：只取指定期間內的資料
              (a.type IN ('revenue', 'expense') AND e.entry_date BETWEEN :startDate AND :endDate)
          )
        GROUP BY a.parent_id
        HAVING ABS(SUM(CASE 
                       WHEN a.type IN ('asset', 'expense') THEN j.debit - j.credit
                       WHEN a.type IN ('liability', 'equity', 'revenue') THEN j.credit - j.debit
                       ELSE j.debit - j.credit
                   END)) > 0.01
        """, nativeQuery = true)
    List<Object[]> findParentBalancesByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}