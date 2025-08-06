package com.example.erp.repository;

import com.example.erp.entity.AmortizationSchedule;
import com.example.erp.entity.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AmortizationScheduleRepository extends JpaRepository<AmortizationSchedule, Long> {

    // 查全部 ACTIVE 的排程
    List<AmortizationSchedule> findByStatus(ScheduleStatus status);

    // 查指定日期要攤提的排程
    List<AmortizationSchedule> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
        ScheduleStatus status, LocalDate startDate, LocalDate endDate
    );

    // 查某個明細的排程（用於檢查是否已建立過攤提）
    List<AmortizationSchedule> findByJournalDetailId(Long journalDetailId);
}
