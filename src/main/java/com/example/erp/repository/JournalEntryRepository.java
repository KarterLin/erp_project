package com.example.erp.repository;

import com.example.erp.entity.JournalEntry;

import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long>, JpaSpecificationExecutor<JournalEntry> {
	// 自訂查詢：計算某個日期的分錄筆數
    long countByEntryDate(LocalDate entryDate);
    
    @Query("SELECT e FROM JournalEntry e WHERE e.entryDate BETWEEN :start AND :end")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<JournalEntry> lockEntries(@Param("start") LocalDate start,
                                   @Param("end") LocalDate end);
}
