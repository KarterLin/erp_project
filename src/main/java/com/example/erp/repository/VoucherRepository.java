package com.example.erp.repository;

import com.example.erp.dto.VoucherDTO;
import com.example.erp.entity.JournalDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for retrieving voucher details.
 */
@Repository
public interface VoucherRepository extends JpaRepository<JournalDetail, Long> {

    @Query("select new com.example.erp.dto.VoucherDTO(e.voucherNumber, a.name, a.code, d.debit, d.credit, d.description) " +
           "from JournalDetail d " +
           "join d.journalEntry e " +
           "join d.account a " +
           "where e.voucherNumber = :voucherNumber " +
           "AND d.isActive = true")
    List<VoucherDTO> findVoucherDetails(@Param("voucherNumber") String voucherNumber);
    
    @Query("select new com.example.erp.dto.VoucherDTO(e.voucherNumber, a.name, a.code, d.debit, d.credit, d.description) " +
            "from JournalDetail d " +
            "join d.journalEntry e " +
            "join d.account a " +
            "Where d.isActive = true")
     List<VoucherDTO> findAllVoucherDetails();
}
