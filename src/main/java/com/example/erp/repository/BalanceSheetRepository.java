package com.example.erp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.erp.entity.JournalDetail;

@Repository
public interface BalanceSheetRepository extends JpaRepository<JournalDetail, Long> {

    @Query(value = """
        SELECT a.parent_id AS parentId,
               SUM(j.debit) - SUM(j.credit) AS balance
        FROM journal_detail j
        JOIN account a ON j.account_id = a.id
        WHERE a.is_active = 1
          AND j.is_active = 1
        GROUP BY a.parent_id
    """, nativeQuery = true)
    List<Object[]> findParentBalances();
}
