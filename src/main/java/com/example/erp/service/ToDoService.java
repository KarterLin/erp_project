package com.example.erp.service;

import com.example.erp.dto.ToDoEntryDTO;
import com.example.erp.dto.ToDoEntryDTO.ToDoDetailDTO;
import com.example.erp.entity.JournalEntry;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.EntryStatus;
import com.example.erp.repository.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ToDoService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    /**
     * 獲取所有待辦分錄，按傳票編號分組
     */
    public List<ToDoEntryDTO> getAllToDoEntries() {
        // 使用原生 SQL 查詢以包含用戶資訊
        String sql = """
            SELECT DISTINCT 
                je.entry_date,
                je.voucher_number,
                je.status,
                u.account as input_user,
                je.reason
            FROM journal_entry je
            LEFT JOIN user_info u ON je.user_id = u.id
            WHERE je.status IN ('PENDING', 'APPROVED', 'REJECTED')
            ORDER BY je.entry_date DESC, je.voucher_number DESC
        """;

        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(sql).getResultList();
        
        Map<String, ToDoEntryDTO> groupedEntries = new LinkedHashMap<>();
        
        for (Object[] row : results) {
            String voucherNumber = (String) row[1];
            
            if (!groupedEntries.containsKey(voucherNumber)) {
                ToDoEntryDTO todoEntry = new ToDoEntryDTO();
                todoEntry.setEntryDate(((Date) row[0]).toLocalDate());
                todoEntry.setVoucherNumber(voucherNumber);
                todoEntry.setStatus(getStatusDisplayText((String) row[2]));
                todoEntry.setInputUser((String) row[3]); // 輸入人員
                todoEntry.setReason((String) row[4]);    // 審核原因
                
                // 獲取該傳票的詳細資料
                todoEntry.setDetails(getDetailsForVoucher(voucherNumber));
                
                groupedEntries.put(voucherNumber, todoEntry);
            }
        }
        
        return new ArrayList<>(groupedEntries.values());
    }
    
    /**
     * 獲取指定傳票的詳細資料
     */
    private List<ToDoDetailDTO> getDetailsForVoucher(String voucherNumber) {
        String detailSql = """
            SELECT 
                a.code,
                a.name,
                jd.debit,
                jd.credit,
                jd.description
            FROM journal_detail jd
            JOIN journal_entry je ON jd.journal_entry_id = je.id
            JOIN account a ON jd.account_id = a.id
            WHERE je.voucher_number = ?
            ORDER BY jd.id
        """;
        
        @SuppressWarnings("unchecked")
        List<Object[]> detailResults = entityManager.createNativeQuery(detailSql)
                .setParameter(1, voucherNumber)
                .getResultList();
        
        List<ToDoDetailDTO> details = new ArrayList<>();
        
        for (Object[] row : detailResults) {
            ToDoDetailDTO detail = new ToDoDetailDTO();
            detail.setAccountCode((String) row[0]);
            detail.setAccountName((String) row[1]);
            detail.setDebitAmount((BigDecimal) row[2]);
            detail.setCreditAmount((BigDecimal) row[3]);
            detail.setDescription((String) row[4]);
            
            details.add(detail);
        }
        
        return details;
    }
    
    /**
     * 將資料庫狀態轉換為顯示文字
     */
    private String getStatusDisplayText(String status) {
        if (status == null) return "未知狀態";
        
        switch (status) {
            case "PENDING":
                return "已提交待審核";
            case "APPROVED":
                return "已審核通過";
            case "REJECTED":
                return "已退回";
            default:
                return "未知狀態";
        }
    }
}