package com.example.erp.repository;

import com.example.erp.entity.JournalDetail;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalDetailRepository extends JpaRepository<JournalDetail, Long> {
	@Query("SELECT " +
		       "COALESCE(SUM(CASE WHEN a.type = 'revenue' THEN d.credit - d.debit ELSE 0 END ),0) - " +
		       "COALESCE(SUM(CASE WHEN a.type = 'expense' THEN d.debit - d.credit ELSE 0 END ),0)  " +
		       "FROM JournalDetail d " +
		       "JOIN d.journalEntry e " +
		       "JOIN d.account a " +
		       "WHERE e.entryDate BETWEEN :start AND :end "+
		       "AND a.type IN('revenue','expense')")
		BigDecimal calcRetainedEarning(@Param("start") LocalDate start,
	            @Param("end") LocalDate end);
	
	 @Query("SELECT COALESCE(SUM(d.debit), 0) " +
	           "FROM JournalDetail d " +
	           "WHERE d.amortizationSchedule.id = :scheduleId " +
	           "AND d.isSystemGenerated = true")
	    BigDecimal sumSystemGeneratedAmountByScheduleId(@Param("scheduleId") Long scheduleId);

	 @Query("SELECT COUNT(d) FROM JournalDetail d WHERE d.isSystemGenerated = true AND d.amortizationSchedule.id = :scheduleId")
	 long countSystemGeneratedDetailsByScheduleId(@Param("scheduleId") Long scheduleId);

		
//		@Query("SELECT COUNT(d) FROM JournalDetail d " +
//			       "JOIN d.journalEntry e " +
//			       "WHERE e.entryDate BETWEEN :start AND :end " +
//			       "AND d.isSystemGenerated = true")
//			long countSystemGeneratedInPeriod(@Param("start") LocalDate start,
//			                                   @Param("end") LocalDate end);
		
		

}
