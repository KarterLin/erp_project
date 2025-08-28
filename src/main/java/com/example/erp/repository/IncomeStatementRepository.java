package com.example.erp.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.erp.dto.ParentCategoryAmount;
import com.example.erp.entity.JournalDetail;

@Repository
public interface IncomeStatementRepository extends JpaRepository<JournalDetail, Long> {

    @Query("""
    SELECT new com.example.erp.dto.ParentCategoryAmount(
        a.parentId,
        CASE 
            WHEN a.parentId = 4000 THEN ABS(SUM(jd.credit) - SUM(jd.debit))
            WHEN a.parentId IN (5000, 6100, 6200, 6300) THEN -ABS(SUM(jd.debit) - SUM(jd.credit))
            ELSE (SUM(jd.debit) - SUM(jd.credit))
        END
    )
    FROM JournalDetail jd
    JOIN jd.account a
    JOIN jd.journalEntry je
    WHERE je.entryDate >= :startDate
      AND je.entryDate <= :endDate
      AND je.status = com.example.erp.entity.EntryStatus.APPROVED
    GROUP BY a.parentId
""")
List<ParentCategoryAmount> findAmountsByDateRange(
    @Param("startDate") LocalDate startDate,
    @Param("endDate") LocalDate endDate
);

}