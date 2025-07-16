package com.example.erp.repository;

import com.example.erp.entity.JournalDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalDetailRepository extends JpaRepository<JournalDetail, Long> {
}
