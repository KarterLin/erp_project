package com.example.erp.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.erp.dto.TrialBalanceDTO;
import com.example.erp.dto.TrialBalanceSummaryDTO;
import com.example.erp.entity.JournalDetail;

@Repository
public interface TrialBalanceRepository  extends JpaRepository<JournalDetail, Long>{
	
	@Query("SELECT new com.example.erp.dto.TrialBalanceDTO(" +
		       "a.code, a.name, " +
		       "SUM(COALESCE(d.debit, 0)) - SUM(COALESCE(d.credit, 0))) " +
		       "FROM JournalDetail d " +
		       "JOIN d.account a " +
		       "JOIN d.journalEntry e " +
		       "WHERE d.isActive = true AND (" +
		       "  (a.type IN ('revenue', 'expense') AND e.entryDate BETWEEN :start AND :end) " +
		       "  OR (a.type IN ('asset', 'liability', 'equity') AND a.id <> 65) " +
		       "  OR (a.id = 65 AND e.entryDate < :end)" +
		       ") " +
		       "GROUP BY a.code, a.name " +
		       "ORDER BY a.code")
	List<TrialBalanceDTO> findTB(@Param("start") LocalDate start,
            @Param("end") LocalDate end);
	
	
	@Query("SELECT new com.example.erp.dto.TrialBalanceSummaryDTO(" +
	           "SUM(COALESCE(d.debit, 0)), SUM(COALESCE(d.credit, 0))) " +
	           "FROM JournalDetail d " +
	           "JOIN d.account a " +
	           "JOIN d.journalEntry e " +
	           "WHERE d.isActive = true AND (" +
	           "  (a.type IN ('revenue', 'expense') AND e.entryDate BETWEEN :start AND :end) " +
	           "  OR (a.type IN ('asset', 'liability', 'equity') AND a.id <> 65) " +
	           "  OR (a.id = 65 AND e.entryDate < :end)" +
	           ")")
	TrialBalanceSummaryDTO findSummary(@Param("start") LocalDate start,
	                                       @Param("end") LocalDate end);
}
