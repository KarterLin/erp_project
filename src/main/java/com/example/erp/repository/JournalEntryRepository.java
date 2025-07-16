package com.example.erp.repository;

import com.example.erp.entity.JournalEntry;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
	// 自訂查詢：計算某個日期的分錄筆數
    long countByEntryDate(LocalDate entryDate);
}
